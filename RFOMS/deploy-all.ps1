#!/usr/bin/env pwsh
# Full redeploy: seed EC2 Mongo + push new images to ECR + restart containers
# Run from: D:\project\RFOM\RFOMS
# Usage: .\deploy-all.ps1

$KEY       = "C:\Users\Victus\Downloads\docker.pem"
$EC2_HOST  = "ec2-user@ec2-16-171-195-52.eu-north-1.compute.amazonaws.com"
$ECR_REPO  = "237024525984.dkr.ecr.eu-north-1.amazonaws.com"
$REGION    = "eu-north-1"

Write-Host "`n[1/5] SSH connectivity check..." -ForegroundColor Cyan
ssh -i $KEY -o StrictHostKeyChecking=no $EC2_HOST "echo SSH_OK"
if ($LASTEXITCODE -ne 0) { Write-Error "SSH failed. Check key path and EC2 state."; exit 1 }

# ── Seed EC2 MongoDB ─────────────────────────────────────────────────────────
Write-Host "`n[2/5] Seeding EC2 MongoDB..." -ForegroundColor Cyan
$seedJs = @'
const mongoose = require("/usr/lib/node_modules/mongoose") || (() => { throw new Error("no mongoose") })();
(async () => {
  try { require(["/usr/lib/node_modules/mongoose"]); } catch(e) {}
})();
'@

# We seed by running a mongo shell script directly inside the mongodb container
$mongoSeed = @'
db = db.getSiblingDB("rfom");

// Create seed owner user doc (no auth - just track ownership)
const ownerId = new ObjectId();
const customerId = new ObjectId();

db.users.deleteMany({ email: { $in: ["restaurant-owner@dhaba.com","customer@dhaba.com"] } });
db.users.insertMany([
  { _id: ownerId, email: "restaurant-owner@dhaba.com", name: "Dhaba Owner", role: "restaurant_owner", city: "Delhi", country: "India" },
  { _id: customerId, email: "customer@dhaba.com", name: "Test Customer", role: "customer", city: "Delhi", country: "India" }
]);

db.restaurants.deleteMany({ "user": ownerId });

const restaurants = [
  { restaurantName: "Punjab Da Dhaba", city: "Delhi", country: "India", deliveryPrice: 4000, estimatedDeliveryTime: 35, cuisines: ["North Indian","Punjabi"], imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", rating: 4.3, totalRatings: 1250, tags: ["Popular"], isOpen: true, address: "45 Chandni Chowk", minOrderAmount: 15000, avgCostForTwo: 50000, menuItems: [{ name:"Butter Chicken",price:28000,isVeg:false,category:"Main Course",isPopular:true,spiceLevel:"medium",description:"Creamy tomato curry" },{ name:"Dal Makhani",price:22000,isVeg:true,category:"Main Course",isPopular:true,spiceLevel:"mild",description:"Slow-cooked lentils" },{ name:"Paneer Tikka",price:24000,isVeg:true,category:"Starters",isPopular:true,spiceLevel:"medium",description:"Grilled cottage cheese" },{ name:"Garlic Naan",price:6000,isVeg:true,category:"Breads",spiceLevel:"mild",description:"Soft naan" },{ name:"Chicken Biryani",price:26000,isVeg:false,category:"Rice",isPopular:true,spiceLevel:"hot",description:"Fragrant rice with chicken" }] },
  { restaurantName: "Hyderabadi Biryani House", city: "Hyderabad", country: "India", deliveryPrice: 3000, estimatedDeliveryTime: 40, cuisines: ["Hyderabadi","Biryani"], imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", rating: 4.5, totalRatings: 2100, tags: ["Bestseller"], isOpen: true, address: "Banjara Hills", minOrderAmount: 20000, avgCostForTwo: 60000, menuItems: [{ name:"Hyderabadi Dum Biryani",price:30000,isVeg:false,category:"Biryani",isPopular:true,spiceLevel:"hot",description:"Authentic biryani" },{ name:"Chicken 65",price:22000,isVeg:false,category:"Starters",isPopular:true,spiceLevel:"extra-hot",description:"Spicy fried chicken" },{ name:"Mutton Haleem",price:28000,isVeg:false,category:"Main Course",isPopular:true,spiceLevel:"medium",description:"Slow-cooked stew" }] },
  { restaurantName: "Chennai Dosa Corner", city: "Chennai", country: "India", deliveryPrice: 2500, estimatedDeliveryTime: 25, cuisines: ["South Indian","Dosa"], imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800", rating: 4.1, totalRatings: 850, tags: ["Pure Veg"], isOpen: true, address: "Anna Salai", minOrderAmount: 10000, avgCostForTwo: 25000, menuItems: [{ name:"Masala Dosa",price:12000,isVeg:true,category:"Dosa",isPopular:true,spiceLevel:"medium",description:"Crispy crepe with potato" },{ name:"Idli Sambar",price:8000,isVeg:true,category:"Tiffin",isPopular:true,spiceLevel:"mild",description:"Steamed rice cakes" },{ name:"Filter Coffee",price:5000,isVeg:true,category:"Beverages",isPopular:true,spiceLevel:"mild",description:"South Indian filter coffee" }] },
  { restaurantName: "Mumbai Street Bites", city: "Mumbai", country: "India", deliveryPrice: 3500, estimatedDeliveryTime: 30, cuisines: ["Street Food","Chaat"], imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", rating: 4.0, totalRatings: 670, tags: ["Budget Friendly"], isOpen: true, address: "Marine Drive", minOrderAmount: 10000, avgCostForTwo: 30000, menuItems: [{ name:"Vada Pav",price:5000,isVeg:true,category:"Street Food",isPopular:true,spiceLevel:"hot",description:"Potato fritter in bun" },{ name:"Pav Bhaji",price:14000,isVeg:true,category:"Street Food",isPopular:true,spiceLevel:"medium",description:"Spiced veggie mash" },{ name:"Bhel Puri",price:8000,isVeg:true,category:"Chaat",isPopular:true,spiceLevel:"medium",description:"Puffed rice with tamarind" }] },
  { restaurantName: "Rajasthani Rasoi", city: "Jaipur", country: "India", deliveryPrice: 3000, estimatedDeliveryTime: 45, cuisines: ["Rajasthani","Thali"], imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800", rating: 4.4, totalRatings: 530, tags: ["Pure Veg"], isOpen: true, address: "MI Road", minOrderAmount: 20000, avgCostForTwo: 55000, menuItems: [{ name:"Dal Baati Churma",price:25000,isVeg:true,category:"Main Course",isPopular:true,spiceLevel:"mild",description:"Baked wheat balls" },{ name:"Rajasthani Thali",price:35000,isVeg:true,category:"Thali",isPopular:true,spiceLevel:"medium",description:"Full thali meal" },{ name:"Ghevar",price:15000,isVeg:true,category:"Desserts",isPopular:true,spiceLevel:"mild",description:"Traditional sweet" }] },
  { restaurantName: "Kerala Spice Garden", city: "Kochi", country: "India", deliveryPrice: 3500, estimatedDeliveryTime: 40, cuisines: ["Kerala","Coastal"], imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", rating: 4.2, totalRatings: 420, tags: ["Coastal Specials"], isOpen: true, address: "Fort Kochi", minOrderAmount: 15000, avgCostForTwo: 55000, menuItems: [{ name:"Kerala Fish Curry",price:28000,isVeg:false,category:"Main Course",isPopular:true,spiceLevel:"hot",description:"Tangy fish curry" },{ name:"Appam with Stew",price:18000,isVeg:true,category:"Tiffin",isPopular:true,spiceLevel:"mild",description:"Lacy rice pancake" },{ name:"Thalassery Biryani",price:30000,isVeg:false,category:"Biryani",isPopular:true,spiceLevel:"medium",description:"Kerala biryani" }] },
  { restaurantName: "Kolkata Roll Junction", city: "Kolkata", country: "India", deliveryPrice: 2500, estimatedDeliveryTime: 25, cuisines: ["Street Food","Rolls"], imageUrl: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800", rating: 3.9, totalRatings: 310, tags: ["Quick Delivery"], isOpen: true, address: "Park Street", minOrderAmount: 10000, avgCostForTwo: 25000, menuItems: [{ name:"Egg Roll",price:10000,isVeg:false,category:"Rolls",isPopular:true,spiceLevel:"medium",description:"Egg wrapped roti" },{ name:"Chicken Roll",price:14000,isVeg:false,category:"Rolls",isPopular:true,spiceLevel:"medium",description:"Chicken tikka wrap" },{ name:"Mishti Doi",price:8000,isVeg:true,category:"Desserts",isPopular:true,spiceLevel:"mild",description:"Sweet yogurt" }] },
  { restaurantName: "Gujarati Bhojanalaya", city: "Ahmedabad", country: "India", deliveryPrice: 2000, estimatedDeliveryTime: 30, cuisines: ["Gujarati","Thali"], imageUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800", rating: 4.6, totalRatings: 780, tags: ["Pure Veg","Top Rated"], isOpen: true, address: "CG Road", minOrderAmount: 15000, avgCostForTwo: 45000, menuItems: [{ name:"Gujarati Thali",price:30000,isVeg:true,category:"Thali",isPopular:true,spiceLevel:"mild",description:"Unlimited thali" },{ name:"Dhokla",price:8000,isVeg:true,category:"Starters",isPopular:true,spiceLevel:"mild",description:"Steamed gram cake" },{ name:"Shrikhand",price:10000,isVeg:true,category:"Desserts",isPopular:true,spiceLevel:"mild",description:"Sweet saffron yogurt" }] },
  { restaurantName: "Amritsari Tandoor", city: "Amritsar", country: "India", deliveryPrice: 3500, estimatedDeliveryTime: 35, cuisines: ["Punjabi","Tandoori"], imageUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800", rating: 4.3, totalRatings: 980, tags: ["Famous Kulchas"], isOpen: true, address: "Lawrence Road", minOrderAmount: 15000, avgCostForTwo: 50000, menuItems: [{ name:"Amritsari Kulcha",price:14000,isVeg:true,category:"Breads",isPopular:true,spiceLevel:"medium",description:"Stuffed kulcha" },{ name:"Tandoori Chicken",price:45000,isVeg:false,category:"Tandoori",isPopular:true,spiceLevel:"hot",description:"Char-grilled chicken" },{ name:"Amritsari Fish",price:28000,isVeg:false,category:"Starters",isPopular:true,spiceLevel:"hot",description:"Gram flour battered fish" }] },
  { restaurantName: "Bangalore Bites Cafe", city: "Bangalore", country: "India", deliveryPrice: 3000, estimatedDeliveryTime: 30, cuisines: ["South Indian","Cafe"], imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800", rating: 3.8, totalRatings: 250, tags: ["Cafe"], isOpen: true, address: "Indiranagar", minOrderAmount: 12000, avgCostForTwo: 40000, menuItems: [{ name:"Bisi Bele Bath",price:14000,isVeg:true,category:"Rice",isPopular:true,spiceLevel:"medium",description:"Spiced rice with lentils" },{ name:"Gobi Manchurian",price:16000,isVeg:true,category:"Chinese",isPopular:true,spiceLevel:"hot",description:"Crispy cauliflower" },{ name:"Mango Lassi",price:9000,isVeg:true,category:"Beverages",isPopular:true,spiceLevel:"mild",description:"Mango yogurt drink" }] }
];

restaurants.forEach(r => {
  r.user = ownerId;
  r.lastUpdated = new Date();
  r.isVeg = r.isVeg || false;
  r.offers = r.offers || [];
  r.phone = r.phone || "";
});

db.restaurants.deleteMany({});
db.restaurants.insertMany(restaurants);
print("SEEDED: " + db.restaurants.countDocuments() + " restaurants, " + db.users.countDocuments() + " users");
'@

# Write seed JS to temp file and copy via SSH stdin redirect
$seedJs | ssh -i $KEY -o StrictHostKeyChecking=no $EC2_HOST "cat > /tmp/seed.js && docker exec -i mongodb mongosh rfom /tmp/seed.js"
if ($LASTEXITCODE -ne 0) { Write-Error "Seeding failed"; exit 1 }

# ── Build & push backend image ────────────────────────────────────────────────
Write-Host "`n[3/5] Building & pushing backend image to ECR..." -ForegroundColor Cyan
$ecrToken = aws ecr get-login-password --region $REGION
$ecrToken | docker login --username AWS --password-stdin "$ECR_REPO"
if ($LASTEXITCODE -ne 0) { Write-Error "ECR login failed"; exit 1 }

Set-Location D:\project\RFOM\RFOMS\food-ordering-backend
docker build -t rfoms-backend .
docker tag rfoms-backend:latest "$ECR_REPO/rfoms-backend:latest"
docker push "$ECR_REPO/rfoms-backend:latest"
if ($LASTEXITCODE -ne 0) { Write-Error "Backend push failed"; exit 1 }

# ── Build & push frontend image ───────────────────────────────────────────────
Write-Host "`n[4/5] Building & pushing frontend image to ECR..." -ForegroundColor Cyan
Set-Location D:\project\RFOM\RFOMS\food-ordering-frontend
docker build -t rfoms-frontend .
docker tag rfoms-frontend:latest "$ECR_REPO/rfoms-frontend:latest"
docker push "$ECR_REPO/rfoms-frontend:latest"
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend push failed"; exit 1 }

# ── Redeploy on EC2 ───────────────────────────────────────────────────────────
Write-Host "`n[5/5] Redeploying on EC2..." -ForegroundColor Cyan
$ecrToken | ssh -i $KEY -o StrictHostKeyChecking=no $EC2_HOST `
  "docker login --username AWS --password-stdin $ECR_REPO &&
   docker rm -f rfoms-backend rfoms-frontend 2>/dev/null || true &&
   docker pull $ECR_REPO/rfoms-backend:latest &&
   docker pull $ECR_REPO/rfoms-frontend:latest &&
   docker network create rfoms-net 2>/dev/null || true &&
   docker run -d --name rfoms-backend --network rfoms-net --restart always -p 5000:5000 \
     -e MONGODB_URI=mongodb://mongodb:27017/rfom \
     -e FRONTEND_URL=http://13.51.209.12:5173 \
     -e BACKEND_URL=http://13.51.209.12:5000 \
     -e JWT_SECRET_KEY=rfom_jwt_super_secret_2024_do_not_share \
     $ECR_REPO/rfoms-backend:latest &&
   docker run -d --name rfoms-frontend --restart always -p 5173:5173 \
     -e VITE_API_BASE_URL=http://13.51.209.12:5000 \
     $ECR_REPO/rfoms-frontend:latest &&
   sleep 5 &&
   docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' &&
   docker logs rfoms-backend --tail 20"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "   Frontend : http://16.171.195.52:5173"
Write-Host "   Backend  : http://16.171.195.52:5000"
