// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyToken.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RealEstateTokenFactory {
    using Strings for uint256;

    struct Property {
        string propertyAddress;
        uint256 value; 
        address tokenAddress;
        string[] propertyImageURLs;
        string[] documentURLs;
        address originalOwner;
        string title;
        string description;
        string propertyType; 
        string apartmentType; 
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 area; // in sq ft
        uint256 yearBuilt;
        string city;
        string state;
        string zipCode;
        string[] amenities;
    }

    struct Listing {
        address seller;
        uint256 tokenAmount;
        uint256 pricePerToken;
    }

    struct PendingProperty {
        string propertyAddress;
        uint256 value;
        address originalOwner;
        string[] propertyImageURLs;
        string[] documentURLs;
        bool approved;
        bool exists;
        string title;
        string description;
        string propertyType;
        string apartmentType;
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 area;
        uint256 yearBuilt;
        string city;
        string state;
        string zipCode;
        string[] amenities;
    }

    Property[] public properties;
    mapping(uint256 => PendingProperty) public pendingProperties;
    uint256 public nextPendingPropertyId;
    uint256[] public activePendingPropertyIds;


    address public owner;

    // Mapping: propertyId => address => amount bought from 40% pool
    mapping(uint256 => mapping(address => uint256)) private propertyBuyers;
    // Mapping: propertyId => all unique buyers
    mapping(uint256 => address[]) private buyerList;

    // Mapping: propertyId => active listings
    mapping(uint256 => Listing[]) private listings;

    constructor() {
        owner = msg.sender;
    }

    function submitPropertyForApproval(
        string memory _propertyAddress,
        uint256 _valueUSD,
        string[] memory _propertyImageURLs,
        string[] memory _documentURLs,
        string memory _title,
        string memory _description,
        string memory _propertyType,
        string memory _apartmentType,
        uint256 _bedrooms,
        uint256 _bathrooms,
        uint256 _area,
        uint256 _yearBuilt,
        string memory _city,
        string memory _state,
        string memory _zipCode,
        string[] memory _amenities
    ) public {
        pendingProperties[nextPendingPropertyId] = PendingProperty({
            propertyAddress: _propertyAddress,
            value: _valueUSD,
            originalOwner: msg.sender,
            approved: false,
            exists: true,
            propertyImageURLs: _propertyImageURLs,
            documentURLs: _documentURLs,
            title: _title,
            description: _description,
            propertyType: _propertyType,
            apartmentType: _apartmentType,
            bedrooms: _bedrooms,
            bathrooms: _bathrooms,
            area: _area,
            yearBuilt: _yearBuilt,
            city: _city,
            state: _state,
            zipCode: _zipCode,
            amenities: _amenities
        });
        activePendingPropertyIds.push(nextPendingPropertyId);
        nextPendingPropertyId++;
    }


    function approveAndTokenizeProperty(uint256 pendingIndex) public {
        require(msg.sender == owner, "Only admin can approve");
        PendingProperty storage pending = pendingProperties[pendingIndex];
        require(pending.exists && !pending.approved, "Already handled or invalid");

        // Tokenization
        uint256 tokenCount = pending.value / 50;
        string memory name = string(
            abi.encodePacked("Property ", properties.length.toString())
        );
        string memory symbol = string(
            abi.encodePacked("PROP", properties.length.toString())
        );

        PropertyToken token = new PropertyToken(
            name,
            symbol,
            tokenCount,
            pending.originalOwner
        );
        properties.push(
            Property({
                propertyAddress: pending.propertyAddress,
                value: pending.value,
                tokenAddress: address(token),
                propertyImageURLs: pending.propertyImageURLs,
                documentURLs: pending.documentURLs,
                originalOwner: pending.originalOwner,
                title: pending.title,
                description: pending.description,
                propertyType: pending.propertyType,
                apartmentType: pending.apartmentType,
                bedrooms: pending.bedrooms,
                bathrooms: pending.bathrooms,
                area: pending.area,
                yearBuilt: pending.yearBuilt,
                city: pending.city,
                state: pending.state,
                zipCode: pending.zipCode,
                amenities: pending.amenities
            })
        );

        pending.approved = true;
        pending.exists = false;
    }

    function disapproveProperty(uint256 pendingIndex) public {
        require(msg.sender == owner, "Only admin can disapprove");

        PendingProperty storage pending = pendingProperties[pendingIndex];
        require(pending.exists, "Property already handled");

        pending.exists = false;
    }

    function buyFromSale(
    uint256 propertyId,
    uint256 tokenAmount
    ) external payable {
        require(propertyId < properties.length, "Invalid property ID");

        PropertyToken token = PropertyToken(properties[propertyId].tokenAddress);
        uint256 cost = tokenAmount * 50 * (10 ** 18); // Assuming $50 per token in wei
        require(msg.value >= cost, "Insufficient ETH sent");

        // Transfer tokens from admin's sale pool to buyer
        token.transferFromSale(msg.sender, tokenAmount * (10 ** token.decimals()));

        // Send ETH to the property owner
        payable(properties[propertyId].originalOwner).transfer(cost);

        // Refund excess ETH if any
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        // Track buyer info
        if (propertyBuyers[propertyId][msg.sender] == 0) {
            buyerList[propertyId].push(msg.sender);
        }
        propertyBuyers[propertyId][msg.sender] += tokenAmount;
    }

    function listForSale(
        uint256 propertyId,
        uint256 tokenAmount,
        uint256 pricePerToken
    ) external {
        PropertyToken token = PropertyToken(
            properties[propertyId].tokenAddress
        );
        require(
            token.balanceOf(msg.sender) >=
                tokenAmount * (10 ** token.decimals()),
            "Not enough tokens"
        );

        token.transferFrom(
            msg.sender,
            address(this),
            tokenAmount * (10 ** token.decimals())
        );

        listings[propertyId].push(
            Listing(msg.sender, tokenAmount, pricePerToken)
        );
    }

    function buyFromListing(
        uint256 propertyId,
        uint256 listingIndex
    ) external payable {
        Listing storage listing = listings[propertyId][listingIndex];
        uint256 totalCost = listing.tokenAmount * listing.pricePerToken;
        require(msg.value >= totalCost, "Not enough ETH sent");

        PropertyToken token = PropertyToken(
            properties[propertyId].tokenAddress
        );
        token.transfer(
            msg.sender,
            listing.tokenAmount * (10 ** token.decimals())
        );

        payable(listing.seller).transfer(totalCost);

        // Remove listing
        listings[propertyId][listingIndex] = listings[propertyId][
            listings[propertyId].length - 1
        ];
        listings[propertyId].pop();
    }

    function cancelListing(uint256 propertyId, uint256 listingIndex) external {
        Listing storage listing = listings[propertyId][listingIndex];
        require(listing.seller == msg.sender, "Only seller can cancel");
        PropertyToken token = PropertyToken(properties[propertyId].tokenAddress);
        token.transfer(msg.sender, listing.tokenAmount * (10 ** token.decimals()));
        // Remove listing
        listings[propertyId][listingIndex] = listings[propertyId][listings[propertyId].length - 1];
        listings[propertyId].pop();
    }

    // --- Getters ---

    function getProperties()
        external
        view
        returns (
            string[] memory propertyAddresses,
            uint256[] memory values,
            address[] memory tokenAddresses,
            string[][] memory propertyImageURLsList,
            string[][] memory documentURLsList,
            address[] memory originalOwners,
            string[] memory titles,
            string[] memory descriptions,
            string[] memory propertyTypes,
            string[] memory apartmentTypes,
            uint256[] memory bedroomsList,
            uint256[] memory bathroomsList,
            uint256[] memory areas,
            uint256[] memory yearsBuilt,
            string[] memory cities,
            string[] memory states,
            string[] memory zipCodes,
            string[][] memory amenitiesList
        )
    {
        uint256 numProperties = properties.length;
        propertyAddresses = new string[](numProperties);
        values = new uint256[](numProperties);
        tokenAddresses = new address[](numProperties);
        propertyImageURLsList = new string[][](numProperties);
        documentURLsList = new string[][](numProperties);
        originalOwners = new address[](numProperties);
        titles = new string[](numProperties);
        descriptions = new string[](numProperties);
        propertyTypes = new string[](numProperties);
        apartmentTypes = new string[](numProperties);
        bedroomsList = new uint256[](numProperties);
        bathroomsList = new uint256[](numProperties);
        areas = new uint256[](numProperties);
        yearsBuilt = new uint256[](numProperties);
        cities = new string[](numProperties);
        states = new string[](numProperties);
        zipCodes = new string[](numProperties);
        amenitiesList = new string[][](numProperties);

        for (uint256 i = 0; i < numProperties; i++) {
            Property storage prop = properties[i];
            propertyAddresses[i] = prop.propertyAddress;
            values[i] = prop.value;
            tokenAddresses[i] = prop.tokenAddress;
            propertyImageURLsList[i] = prop.propertyImageURLs;
            documentURLsList[i] = prop.documentURLs;
            originalOwners[i] = prop.originalOwner;
            titles[i] = prop.title;
            descriptions[i] = prop.description;
            propertyTypes[i] = prop.propertyType;
            apartmentTypes[i] = prop.apartmentType;
            bedroomsList[i] = prop.bedrooms;
            bathroomsList[i] = prop.bathrooms;
            areas[i] = prop.area;
            yearsBuilt[i] = prop.yearBuilt;
            cities[i] = prop.city;
            states[i] = prop.state;
            zipCodes[i] = prop.zipCode;
            amenitiesList[i] = prop.amenities;
        }
    }

    function getBuyers(
        uint256 propertyId
    ) external view returns (address[] memory) {
        return buyerList[propertyId];
    }

    function getBuyerInfo(
        uint256 propertyId,
        address user
    ) external view returns (uint256 tokensBought) {
        return propertyBuyers[propertyId][user];
    }

    function getListings(
        uint256 propertyId
    ) external view returns (Listing[] memory) {
        return listings[propertyId];
    }

    function getPendingProperties()
    public
    view
    returns (uint256[] memory propertyIds, PendingProperty[] memory propertiesList)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < activePendingPropertyIds.length; i++) {
            uint256 id = activePendingPropertyIds[i];
            if (pendingProperties[id].exists && !pendingProperties[id].approved) {
                count++;
            }
        }

        propertyIds = new uint256[](count);
        propertiesList = new PendingProperty[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < activePendingPropertyIds.length; i++) {
            uint256 id = activePendingPropertyIds[i];
            if (pendingProperties[id].exists && !pendingProperties[id].approved) {
                propertyIds[index] = id;
                propertiesList[index] = pendingProperties[id];
                index++;
            }
        }

        return (propertyIds, propertiesList);
    }


}
