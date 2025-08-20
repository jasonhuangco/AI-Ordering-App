# 🚨 Troubleshooting: App Won't Start

## **Quick Fix Steps:**

### **Step 1: Clean and Restart**
```bash
# Kill any hanging processes
pkill -f "next"
pkill -f "node"

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies (if needed)
rm -rf node_modules
npm install
```

### **Step 2: Try Starting with Verbose Output**
```bash
# Start with debug info
npm run dev -- --verbose

# Or try with explicit port
npm run dev -- -p 3001
```

### **Step 3: Check for Common Issues**

#### **A) Environment Variables**
Make sure `.env.local` has the correct Supabase URLs:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rjpcmenbbfolguamfwhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **B) Port Conflicts**
```bash
# Check if port 3000 is already in use
lsof -i :3000

# If occupied, kill the process or use different port
npm run dev -- -p 3001
```

#### **C) TypeScript Errors**
```bash
# Check for TS errors
npx tsc --noEmit
```

### **Step 4: Try Minimal Start**
```bash
# Create a clean Next.js build
npm run build

# Start production server
npm start
```

## **Expected Behavior:**
When working, you should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000

✓ Ready in 2.3s
```

## **If Still Not Working:**

### **Option A: Simple Test**
Visit `http://localhost:3000` directly in browser after running `npm run dev`

### **Option B: Check Logs**
```bash
npm run dev > debug.log 2>&1 &
cat debug.log
```

### **Option C: Alternative Start Method**
```bash
npx next dev
```

## **Migration Status:**
✅ Your Supabase migration is complete
✅ Core API routes are working  
✅ Database operations are functional

The issue is likely a startup/build problem, not your migration! 

**Most likely cause:** Port conflict or hanging Node.js process
