'use client';
import React, { useState } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { ethers } from 'ethers';
import contractAddress from '../../../contracts/contract-address.json';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import { uploadToIPFS } from '../../components/utils/contractInteraction';
import PropertyForm from './components/PropertyForm';
import ImageUploader from './components/ImageUploader';
import FormNavigation from './components/FormNavigation';
import ProgressBar from './components/ProgressBar';
import SuccessMessage from './components/SuccessMessage';
import ErrorMessage from './components/ErrorMessage';
import DocumentUploader from './components/DocumentUploader';

export default function SellPage() {
  // Form state
  const [formData, setFormData] = useState({
    propertyType: 'apartment',
    apartmentType: '',
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    yearBuilt: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    amenities: [] as string[],
  });

  // Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [ipfsHashes, setIpfsHashes] = useState<string[]>([]);

  // Document upload state
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentHashes, setDocumentHashes] = useState<string[]>([]);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Step navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!validateStep(currentStep)) {
      return;
    }

    // Check if images are uploaded
    if (images.length === 0) {
      setErrors((prev) => ({ ...prev, images: 'Please upload at least one image' }));
      return;
    }

    // Check if documents are uploaded
    if (documents.length === 0) {
      setErrors((prev) => ({ ...prev, documents: 'Please upload at least one document' }));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Upload images to IPFS
      const hashes = await Promise.all(
        images.map(async (image) => {
          return await uploadToIPFS(image);
        })
      );

      setIpfsHashes(hashes);

      // Upload documents to IPFS
      const docHashes = await Promise.all(
        documents.map(async (doc) => {
          return await uploadToIPFS(doc);
        })
      );

      setDocumentHashes(docHashes);

      // Submit property data to blockchain
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const factoryContractAddress = contractAddress.RealEstateTokenFactory;
        const contract = new ethers.Contract(factoryContractAddress, RealEstateTokenFactoryABI, signer);

        // Create property object with all details
        const propertyData = {
          propertyAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          valueUSD: ethers.parseUnits(formData.price, 18), 
          imageUrls: hashes,
          documentUrls: docHashes,
          title: formData.title,
          description: formData.description,
          bedrooms: parseInt(formData.bedrooms, 10),
          bathrooms: parseInt(formData.bathrooms, 10),
          area: parseInt(formData.area, 10),
          yearBuilt: parseInt(formData.yearBuilt, 10),
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          propertyType: formData.propertyType,
          apartmentType: formData.apartmentType,
          amenities: formData.amenities, // Pass amenities as an array
        };

        console.log('Submitting property for approval:', propertyData);

        // Submit property for approval with all new fields
        const tx = await contract.submitPropertyForApproval(
          propertyData.propertyAddress,
          propertyData.valueUSD,
          propertyData.imageUrls,
          propertyData.documentUrls,
          propertyData.title,
          propertyData.description,
          propertyData.propertyType, 
          propertyData.apartmentType, 
          propertyData.bedrooms,
          propertyData.bathrooms,
          propertyData.area,
          propertyData.yearBuilt,
          propertyData.city,
          propertyData.state,
          propertyData.zipCode,
          propertyData.amenities
        );

        await tx.wait();

        setSubmitStatus('success');
        // Reset form after successful submission
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      propertyType: 'apartment',
      apartmentType: '',
      title: '',
      description: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      floor: '',
      totalFloors: '',
      yearBuilt: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      amenities: [],
    });
    setImages([]);
    setPreviewUrls([]);
    setDocuments([]);
    setCurrentStep(1);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    // Clear previous error for this field
    delete newErrors[name];

    // Validation rules based on field name
    switch (name) {
      case 'apartmentType':
        if (!value) newErrors[name] = 'Apartment type is required';
        break;
      case 'title':
        if (!value) newErrors[name] = 'Title is required';
        else if (value.length < 5) newErrors[name] = 'Title must be at least 5 characters';
        break;
      case 'description':
        if (!value) newErrors[name] = 'Description is required';
        else if (value.length < 20) newErrors[name] = 'Description must be at least 20 characters';
        break;
      case 'price':
        if (!value) newErrors[name] = 'Price is required';
        else if (isNaN(Number(value)) || Number(value) <= 0) newErrors[name] = 'Price must be a positive number';
        break;
      case 'bedrooms':
        if (!value) newErrors[name] = 'Number of bedrooms is required';
        else if (isNaN(Number(value)) || Number(value) < 0) newErrors[name] = 'Bedrooms must be a non-negative number';
        break;
      case 'bathrooms':
        if (!value) newErrors[name] = 'Number of bathrooms is required';
        else if (isNaN(Number(value)) || Number(value) < 0) newErrors[name] = 'Bathrooms must be a non-negative number';
        break;
      case 'area':
        if (!value) newErrors[name] = 'Area is required';
        else if (isNaN(Number(value)) || Number(value) <= 0) newErrors[name] = 'Area must be a positive number';
        break;
      case 'address':
        if (!value) newErrors[name] = 'Address is required';
        break;
      case 'city':
        if (!value) newErrors[name] = 'City is required';
        break;
      case 'state':
        if (!value) newErrors[name] = 'State is required';
        break;
      case 'zipCode':
        if (!value) newErrors[name] = 'ZIP code is required';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newTouched: Record<string, boolean> = { ...touched };

    // Fields to validate for each step
    const stepFields: Record<number, string[]> = {
      1: ['apartmentType', 'title', 'description', 'price'],
      2: ['bedrooms', 'bathrooms', 'area'],
      3: ['address', 'city', 'state', 'zipCode'],
      4: [], // No required fields in step 4
    };

    // Validate all fields for the current step
    stepFields[step].forEach((field) => {
      newTouched[field] = true;
      const value = formData[field as keyof typeof formData]?.toString() || '';
      if (!validateField(field, value)) {
        isValid = false;
        // Re-validate to populate errors
        validateField(field, value);
      }
    });

    setTouched(newTouched);
    return isValid;
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      const updatedAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];

      return { ...prev, amenities: updatedAmenities };
    });
  };

  // Limit image uploads to 5
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (images.length + newFiles.length > 5) {
        alert('You can only upload up to 5 images.');
        return;
      }

      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...newFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      // Clear any image-related errors when images are uploaded
      if (errors.images) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }

      // Reset error status if it was related to images
      if (submitStatus === 'error') {
        setSubmitStatus('idle');
      }
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    // Also remove the IPFS hash if it exists
    if (ipfsHashes.length > index) {
      setIpfsHashes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments((prev) => [...prev, ...newFiles]);
      // Clear any document-related errors when documents are uploaded
      if (errors.documents) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.documents;
          return newErrors;
        });
      }
      if (submitStatus === 'error') {
        setSubmitStatus('idle');
      }
    }
  };

  // Remove a document
  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    if (documentHashes.length > index) {
      setDocumentHashes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        // Reset touched for the next step's fields
        const stepFields: Record<number, string[]> = {
          1: ['apartmentType', 'title', 'description', 'price'],
          2: ['bedrooms', 'bathrooms', 'area'],
          3: ['address', 'city', 'state', 'zipCode'],
          4: [],
        };
        const nextStepFields = stepFields[currentStep + 1] || [];
        setTouched((prev) => {
          const updated = { ...prev };
          nextStepFields.forEach((field) => {
            updated[field] = false;
          });
          return updated;
        });
        if (submitStatus === 'error') {
          setSubmitStatus('idle');
        }
        window.scrollTo(0, 0);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (submitStatus === 'error') {
        setSubmitStatus('idle');
      }
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="sell-page-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">List Your Property</h1>

          <div className="sell-glass-progress-container">
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          {submitStatus === 'success' ? (
            <div className="sell-glass-container">
              <SuccessMessage 
                resetForm={resetForm} 
                setSubmitStatus={setSubmitStatus} 
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sell-glass-container">
              {submitStatus === 'error' && (
                <ErrorMessage message="There was an error submitting your property. Please try again." />
              )}

              <PropertyForm
                currentStep={currentStep}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                touched={touched}
                handleInputChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({ ...prev, [name]: value }));
                  setTouched((prev) => ({ ...prev, [name]: true }));
                  validateField(name, value);
                }}
                handleBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                  const { name, value } = e.target;
                  setTouched((prev) => ({ ...prev, [name]: true }));
                  validateField(name, value);
                }}
                handleAmenityToggle={handleAmenityToggle}
                validateField={validateField}
              />

              {currentStep === 4 && (
                <>
                  <ImageUploader
                    images={images}
                    previewUrls={previewUrls}
                    setImages={setImages}
                    setPreviewUrls={setPreviewUrls}
                    errors={errors}
                    setErrors={setErrors}
                    submitStatus={submitStatus}
                    setSubmitStatus={setSubmitStatus}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                  />
                  <DocumentUploader
                    documents={documents}
                    setDocuments={setDocuments}
                    errors={errors}
                    setErrors={setErrors}
                    submitStatus={submitStatus}
                    setSubmitStatus={setSubmitStatus}
                    handleDocumentUpload={handleDocumentUpload}
                    removeDocument={removeDocument}
                  />
                </>
              )}

              <FormNavigation
                currentStep={currentStep}
                totalSteps={totalSteps}
                prevStep={prevStep}
                nextStep={nextStep}
                isSubmitting={isSubmitting}
              />
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
