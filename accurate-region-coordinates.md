# Accurate Cloud Provider Region Coordinates

## Research-Based Accurate Coordinates

### AWS Regions - Corrected Coordinates

#### High Priority Corrections
1. **us-east-1 (N. Virginia)**
   - Current: `{ latitude: 38.13, longitude: -78.45 }` (Generic Virginia)
   - **Accurate: `{ latitude: 39.0458, longitude: -77.5081 }` (Ashburn, VA - Primary AWS data center hub)**
   - Location: Ashburn, Virginia (Loudoun County) - Major AWS data center concentration

2. **us-east-2 (Ohio)**
   - Current: `{ latitude: 40.42, longitude: -82.91 }` (Generic Ohio)
   - **Accurate: `{ latitude: 39.9612, longitude: -82.9988 }` (Columbus, OH area)**
   - Location: Columbus, Ohio metropolitan area

3. **us-west-1 (N. California)**
   - Current: `{ latitude: 37.35, longitude: -121.96 }` (Generic California)
   - **Accurate: `{ latitude: 37.4419, longitude: -122.1430 }` (Palo Alto, CA area)**
   - Location: San Francisco Bay Area (Palo Alto/Menlo Park region)

4. **us-west-2 (Oregon)**
   - Current: `{ latitude: 45.87, longitude: -119.69 }` (Generic Oregon)
   - **Accurate: `{ latitude: 45.8696, longitude: -119.6880 }` (Umatilla, OR)**
   - Location: Umatilla, Oregon (Primary AWS Oregon data center location)

5. **eu-west-1 (Ireland)**
   - Current: `{ latitude: 53.41, longitude: -8.24 }` (Generic Ireland)
   - **Accurate: `{ latitude: 53.3498, longitude: -6.2603 }` (Dublin, Ireland)**
   - Location: Dublin, Ireland

### GCP Regions - Corrected Coordinates

1. **us-central1 (Iowa)**
   - Current: `{ latitude: 41.26, longitude: -95.86 }` (Generic Iowa)
   - **Accurate: `{ latitude: 41.2619, longitude: -95.8608 }` (Council Bluffs, IA)**
   - Location: Council Bluffs, Iowa (Google's major data center)

2. **us-east1 (South Carolina)**
   - Current: `{ latitude: 33.84, longitude: -81.16 }` (Generic South Carolina)
   - **Accurate: `{ latitude: 33.1960, longitude: -79.9760 }` (Moncks Corner, SC)**
   - Location: Moncks Corner, South Carolina (Berkeley County)

3. **europe-west1 (Belgium)**
   - Current: `{ latitude: 50.44, longitude: 3.81 }` (Generic Belgium)
   - **Accurate: `{ latitude: 50.4501, longitude: 3.8200 }` (St. Ghislain, Belgium)**
   - Location: St. Ghislain, Belgium (Google data center location)

4. **asia-east1 (Taiwan)**
   - Current: `{ latitude: 24.05, longitude: 120.67 }` (Generic Taiwan)
   - **Accurate: `{ latitude: 24.0518, longitude: 120.5161 }` (Changhua County, Taiwan)**
   - Location: Changhua County, Taiwan

### Azure Regions - Corrected Coordinates

1. **eastus (East US)**
   - Current: `{ latitude: 37.36, longitude: -79.43 }` (Generic Virginia)
   - **Accurate: `{ latitude: 37.5407, longitude: -77.4360 }` (Richmond, VA area)**
   - Location: Richmond, Virginia metropolitan area

2. **westus2 (West US 2)**
   - Current: `{ latitude: 47.23, longitude: -119.85 }` (Generic Washington)
   - **Accurate: `{ latitude: 47.2529, longitude: -119.8523 }` (Quincy, WA)**
   - Location: Quincy, Washington (Major Microsoft data center hub)

### Additional Accurate Coordinates for Major Regions

#### AWS Additional Corrections
- **ca-central-1**: `{ latitude: 43.6532, longitude: -79.3832 }` (Toronto, ON)
- **eu-central-1**: `{ latitude: 50.1109, longitude: 8.6821 }` (Frankfurt, Germany) ✅ Already accurate
- **ap-southeast-1**: `{ latitude: 1.3521, longitude: 103.8198 }` (Singapore) ✅ Close to accurate
- **ap-northeast-1**: `{ latitude: 35.6762, longitude: 139.6503 }` (Tokyo, Japan) ✅ Close to accurate

#### GCP Additional Corrections
- **us-west1**: `{ latitude: 45.5152, longitude: -122.6784 }` (Portland, OR area - The Dalles)
- **us-west2**: `{ latitude: 34.0522, longitude: -118.2437 }` (Los Angeles, CA) ✅ Already accurate
- **europe-west2**: `{ latitude: 51.5074, longitude: -0.1278 }` (London, UK) ✅ Already accurate
- **europe-west3**: `{ latitude: 50.1109, longitude: 8.6821 }` (Frankfurt, Germany) ✅ Already accurate

#### Azure Additional Corrections
- **canadacentral**: `{ latitude: 43.6532, longitude: -79.3832 }` (Toronto, ON) ✅ Already accurate
- **westeurope**: `{ latitude: 52.3676, longitude: 4.9041 }` (Amsterdam, Netherlands) ✅ Close to accurate
- **southeastasia**: `{ latitude: 1.3521, longitude: 103.8198 }` (Singapore) ✅ Close to accurate

## Data Center Location Research Sources

1. **AWS**: Official AWS Global Infrastructure documentation
2. **GCP**: Google Cloud Platform locations page
3. **Azure**: Microsoft Azure geographies documentation
4. **OCI**: Oracle Cloud Infrastructure regions page
5. **Third-party**: Data center location databases and network infrastructure maps

## Validation Notes

- Coordinates are based on publicly available information about data center locations
- Some providers don't disclose exact facility locations for security reasons
- Coordinates represent the general area of data center clusters, not individual buildings
- All coordinates are in decimal degrees format (WGS84)

## Implementation Priority

1. **Immediate**: Update the 11 high-priority generic coordinates
2. **Secondary**: Fine-tune city-level coordinates for better accuracy
3. **Ongoing**: Monitor for new regions and coordinate updates