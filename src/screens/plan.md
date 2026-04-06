╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 🚗 Complete Driver Mobile App Implementation Plan

 Overview

 Build a production-ready driver app with full API integration, WebSocket tracking, and clean architecture matching
  the rider app patterns.

 Key Decisions:

- ✅ One active booking at a time (simpler state management)
- ✅ Auto-receive requests via WebSocket when online
- ✅ External navigation (Google Maps/Apple Maps)
- ✅ Link to web app for driver registration/KYC

 ---
 Phase 1: Foundation & API Extensions (Day 1-2)

 1.1 Add Missing API Endpoints

 File: packages/api/src/router/driver.ts

 Add driver-specific procedures:

- getCurrentBooking() - Get active booking (DRIVER_ASSIGNED/ARRIVED/IN_PROGRESS)
- getTodayEarnings() - Today's stats (trips, earnings, hours)
- markArrived(bookingId) - Update status to DRIVER_ARRIVED
- startTrip(bookingId) - Update status to IN_PROGRESS
- completeTrip(bookingId, actualFare) - Update status to COMPLETED

 File: packages/api/src/router/booking.ts

 Verify existing endpoints work for drivers:

- getAvailableBookings() - List SEARCHING_DRIVER bookings
- acceptBooking(bookingId) - Assign driver to booking
- rejectBooking(bookingId) - Reject booking request
- updateStatus(id, status) - Update booking status
- getDriverBookings(status?) - Get driver's booking history

 1.2 Create Driver State Management

 File: apps/driver/src/stores/DriverStore.ts

 interface DriverState {
   // Online Status
   isOnline: boolean;
   isAvailable: boolean;

   // Active Booking
   activeBooking: Booking | null;
   activeBookingId: string | null;

   // Pending Requests
   pendingRequests: BookingRequest[];

   // Today's Stats
   todayEarnings: number;
   todayTrips: number;
   onlineTime: number; // minutes

   // Location
   currentLocation: Location | null;

   // Actions
   setOnlineStatus: (isOnline: boolean) => void;
   setActiveBooking: (booking: Booking | null) => void;
   addPendingRequest: (request: BookingRequest) => void;
   removePendingRequest: (requestId: string) => void;
   updateTodayStats: (stats: TodayStats) => void;
   updateLocation: (location: Location) => void;
   reset: () => void;
 }

 1.3 Create Driver Types

 File: apps/driver/src/types/driver.ts

- DriverStatus: "offline" | "online" | "busy" | "unavailable"
- BookingRequest: Incoming booking with rider info, locations, fare
- TodayStats: Earnings, trips, completion rate, online time
- DriverState: Complete store shape

 ---
 Phase 2: Core Hooks & WebSocket Integration (Day 3)

 2.1 Driver Operations Hook

 File: apps/driver/src/hooks/useDriver.ts

 export function useDriver() {
   const { setOnlineStatus, setActiveBooking } = useDriverStore();

   // Toggle online/offline
   const toggleOnline = async (isOnline: boolean) => {
     await api.driver.updateAvailability.mutate({ isOnline });
     setOnlineStatus(isOnline);

     if (isOnline) {
       connectToTracking();
       startLocationTracking();
     } else {
       disconnectTracking();
       stopLocationTracking();
     }
   };

   // Get current active booking
   const { data: currentBooking } = api.driver.getCurrentBooking.useQuery(
     undefined,
     { refetchInterval: 5000 }
   );

   // Get today's stats
   const { data: todayStats } = api.driver.getTodayEarnings.useQuery();

   return { toggleOnline, currentBooking, todayStats };
 }

 2.2 Location Tracking Hook

 File: apps/driver/src/hooks/useLocation.ts

 export function useLocation() {
   const { updateLocation } = useDriverStore();

   // Request location permissions
   const requestPermissions = async () => {
     const { status } = await Location.requestForegroundPermissionsAsync();
     if (status === 'granted') {
       const bg = await Location.requestBackgroundPermissionsAsync();
       return bg.status === 'granted';
     }
     return false;
   };

   // Start location tracking
   const startTracking = async () => {
     const subscription = await Location.watchPositionAsync(
       {
         accuracy: Location.Accuracy.High,
         timeInterval: 5000, // Update every 5s
         distanceInterval: 10, // Or every 10m
       },
       (location) => {
         updateLocation(location.coords);
         sendLocationToServer(location.coords);
       }
     );
     return subscription;
   };

   return { requestPermissions, startTracking };
 }

 2.3 Tracking WebSocket Hook

 File: apps/driver/src/hooks/useTrackingSocket.ts

 export function useTrackingSocket() {
   const { addPendingRequest, removePendingRequest } = useDriverStore();
   const socket = useRef<Socket>();

   // Connect to tracking server
   const connect = () => {
     socket.current = io(TRACKING_SERVER_URL);

     socket.current.on('connect', () => {
       socket.current.emit('join-user-room', userId);
       socket.current.emit('driver-availability', {
         userId,
         isOnline: true,
         isAvailable: true
       });
     });

     // Listen for booking requests
     socket.current.on('booking-request', (request: BookingRequest) => {
       addPendingRequest(request);
       // Show notification
       showBookingNotification(request);
     });

     // Listen for booking status updates
     socket.current.on('booking-status-update', (update) => {
       // Handle cancellations, etc.
     });
   };

   // Send location update
   const sendLocation = (location: Location, bookingId?: string) => {
     socket.current?.emit('location-update', {
       userId,
       bookingId,
       latitude: location.latitude,
       longitude: location.longitude,
       heading: location.heading,
       speed: location.speed,
       timestamp: new Date(),
     });
   };

   return { connect, disconnect, sendLocation };
 }

 ---
 Phase 3: Navigation Structure (Day 4)

 3.1 Update Root Layout

 File: apps/driver/app/_layout.tsx

- Add AnimatedSplash (from mobile-ui)
- Add auth guards with Stack.Protected
- Add ride flow stack navigation
- Check driver status after auth

 3.2 Update Tab Layout

 File: apps/driver/app/(tabs)/_layout.tsx

 Replace current 2 tabs with 4 tabs:

- home: Map with booking requests (icon: "map")
- bookings: Booking history (icon: "list")
- earnings: Earnings dashboard (icon: "cash")
- profile: Driver profile (icon: "person")

 Use same styling pattern as rider app tabs.

 3.3 Add Home Stack Layout

 File: apps/driver/app/(tabs)/home/_layout.tsx

 <Stack>
   <Stack.Screen name="index" /> // Map screen
   <Stack.Screen
     name="(booking)"
     options={{ presentation: "modal" }}
   />
 </Stack>

 3.4 Add Booking Modal Stack

 File: apps/driver/app/(tabs)/home/(booking)/_layout.tsx

 <Stack>
   <Stack.Screen name="request" /> // Booking request details
 </Stack>

 3.5 Add Ride Flow Stack

 File: apps/driver/app/(ride)/_layout.tsx

 <Stack screenOptions={{ headerShown: false }}>
   <Stack.Screen name="pickup" />   // En route to pickup
   <Stack.Screen name="ongoing" />  // Trip in progress
   <Stack.Screen name="complete" /> // Trip complete
 </Stack>

 ---
 Phase 4: Core Screens (Day 5-7)

 4.1 Home Screen - Map & Requests

 File: apps/driver/app/(tabs)/home/index.tsx

 Features:

- MapView with current location
- Large "Go Online" toggle button (top)
  - Offline: Gray, "Go Online"
  - Online: Green, "You're Online"
- Active booking card (bottom sheet)
  - Show rider info, pickup/dropoff, ETA
  - Buttons: "Navigate", "Contact", "Arrived"
- Floating action button: Show pending requests count
- Today's stats card (when no active booking):
  - Earnings, trips, online time

 Layout:
 <Screen style={$screen}>
   <View style={$container}>
     {/*Map*/}
     <MapView style={$map} />

     {/* Online Toggle (top) */}
     <OnlineToggle />

     {/* Active Booking Card (bottom) */}
     {activeBooking && <ActiveBookingCard />}

     {/* Today's Stats (bottom, when no active booking) */}
     {!activeBooking && <TodayStatsCard />}

     {/* Pending Requests FAB */}
     {pendingRequests.length > 0 && (
       <FAB
         count={pendingRequests.length}
         onPress={() => router.push('/home/request')}
       />
     )}
   </View>
 </Screen>

 4.2 Booking Request Modal

 File: apps/driver/app/(tabs)/home/(booking)/request.tsx

 Features:

- List of pending booking requests
- Each card shows:
  - Rider name & rating
  - Pickup & dropoff addresses
  - Distance to pickup (e.g., "2.3 km away")
  - Trip distance (e.g., "5.7 km trip")
  - Estimated fare
  - Vehicle type required
  - Accept / Reject buttons
- Auto-dismiss after 60 seconds
- Navigate to pickup after accept

 Layout:
 <Screen>
   <Header title="Booking Request" />
   <ScrollView>
     {pendingRequests.map(request => (
       <BookingRequestCard
         key={request.id}
         request={request}
         onAccept={handleAccept}
         onReject={handleReject}
       />
     ))}
   </ScrollView>
 </Screen>

 4.3 Pickup Screen

 File: apps/driver/app/(ride)/pickup.tsx

 Features:

- Map with route to pickup location
- Rider info card (name, rating, phone)
- ETA to pickup
- Distance remaining
- "Call Rider" button
- "Message Rider" button
- "Arrived" button (updates status to DRIVER_ARRIVED)
- "Cancel Trip" button (with confirmation)

 Navigation:

- "Navigate" button opens Google Maps/Apple Maps
- After "Arrived", show "Start Trip" button
- "Start Trip" → navigate to /ongoing

 4.4 Ongoing Screen

 File: apps/driver/app/(ride)/ongoing.tsx

 Features:

- Map with route to dropoff
- Rider info (compact)
- Trip stats:
  - ETA to dropoff
  - Current fare (real-time)
  - Distance traveled
  - Trip duration
- "Navigate" button
- "End Trip" button (updates status to COMPLETED)
- Emergency button

 Navigation:

- "End Trip" → navigate to /complete

 4.5 Trip Complete Screen

 File: apps/driver/app/(ride)/complete.tsx

 Features:

- Success icon
- Trip summary:
  - Pickup & dropoff locations
  - Distance traveled
  - Trip duration
  - Final fare
- Rider info
- "Return to Home" button
- Auto-navigate after 5 seconds

 Navigation:

- Return → router.replace('/(tabs)/home') + reset store

 4.6 Bookings Screen

 File: apps/driver/app/(tabs)/bookings.tsx

 Features:

- Tabs: "Active", "Completed", "Cancelled"
- List of bookings from api.booking.getDriverBookings
- Each card shows:
  - Rider name
  - Pickup/dropoff
  - Date/time
  - Fare
  - Status
- Tap to view details
- Pull to refresh

 4.7 Earnings Screen

 File: apps/driver/app/(tabs)/earnings.tsx

 Features:

- Period selector: Today, Week, Month, Year
- Summary cards:
  - Total earnings
  - Trips completed
  - Average fare
  - Completion rate
  - Average rating
- Earnings chart (optional)
- Trip list below
- Export/download (optional)

 Data from: api.driver.getAnalytics({ period })

 4.8 Profile Screen

 File: apps/driver/app/(tabs)/profile/index.tsx

 Features:

- Driver info (name, photo, phone)
- Rating & review count
- Vehicle info (make, model, plate)
- Menu items:
  - Vehicle Details (navigate to vehicle screen)
  - Bank Details
  - Documents
  - Settings
  - Help & Support
  - Sign Out
- Driver status badge (Approved, Pending, etc.)
- If not a driver → show message + "Apply to Drive" button (opens web app)

 ---
 Phase 5: Components (Day 8)

 5.1 Driver Components

 Directory: apps/driver/src/components/driver/

 OnlineToggle.tsx

- Large button at top of home screen
- Shows online/offline status
- Handles toggle with confirmation
- Shows loading state

 BookingRequestCard.tsx

- Booking request with all details
- Countdown timer (60s)
- Accept/Reject buttons
- Shows distance to pickup

 ActiveBookingCard.tsx

- Compact card for active booking
- Shows rider, pickup, dropoff
- Quick action buttons
- Status indicator

 TodayStatsCard.tsx

- Today's earnings, trips, online time
- Small card at bottom of home

 TripCard.tsx

- Past trip card for bookings list
- Shows summary, fare, status

 RiderInfo.tsx

- Rider details (name, rating, photo)
- Contact buttons (call, message)

 5.2 Map Components

 Directory: apps/driver/src/components/map/

 DriverMap.tsx

- MapView wrapper with current location
- Handles markers, routes

 RouteOverlay.tsx

- Polyline from driver → pickup → dropoff
- Updates as driver moves

 ---
 Phase 6: Integration & Testing (Day 9-10)

 6.1 Location Permission Flow

- Request foreground permission on first use
- Request background permission when going online
- Handle permission denied gracefully
- Show settings link if permanently denied

 6.2 WebSocket Connection

- Connect when driver goes online
- Disconnect when driver goes offline
- Auto-reconnect on connection loss
- Handle offline mode gracefully

 6.3 Notification Setup

- Configure push notifications (Expo Notifications)
- Show notification for booking requests
- Show notification for trip updates
- Handle notification taps (deep linking)

 6.4 Background Location

- Configure background location updates
- Send location to server every 5-10s during active trip
- Handle app backgrounding

 6.5 Navigation Integration

- "Navigate" button opens Google Maps with directions
- Fallback to Apple Maps on iOS
- Handle case where no maps app installed

 6.6 Error Handling

- Handle API errors gracefully
- Show retry options
- Handle network disconnections
- Show offline indicator

 ---
 Implementation Order

 Week 1: Foundation

 Day 1:

- ✅ Add missing API endpoints (driver.ts)
- ✅ Create DriverStore.ts
- ✅ Create driver types

 Day 2:

- ✅ Create useDriver.ts hook
- ✅ Create useLocation.ts hook
- ✅ Create useTrackingSocket.ts hook

 Day 3:

- ✅ Update root layout (_layout.tsx)
- ✅ Update tab layout with 4 tabs
- ✅ Add home stack layout
- ✅ Add booking modal stack
- ✅ Add ride flow stack

 Week 2: Core Screens

 Day 4-5:

- ✅ Home screen with map
- ✅ Online toggle functionality
- ✅ Booking request modal
- ✅ Accept/reject booking

 Day 6-7:

- ✅ Pickup screen
- ✅ Ongoing screen
- ✅ Complete screen
- ✅ Navigation integration

 Day 8:

- ✅ Bookings screen
- ✅ Earnings screen
- ✅ Profile screen

 Week 3: Components & Integration

 Day 9:

- ✅ All driver components
- ✅ Location permissions
- ✅ WebSocket integration

 Day 10:

- ✅ Notifications
- ✅ Background location
- ✅ Error handling
- ✅ Testing & bug fixes

 ---
 File Checklist

 API (packages/api/src/router/)

- driver.ts - Add: getCurrentBooking, getTodayEarnings, markArrived, startTrip, completeTrip

 Store

- apps/driver/src/stores/DriverStore.ts

 Hooks

- apps/driver/src/hooks/useDriver.ts
- apps/driver/src/hooks/useLocation.ts
- apps/driver/src/hooks/useTrackingSocket.ts

 Types

- apps/driver/src/types/driver.ts

 Layouts

- apps/driver/app/_layout.tsx (update)
- apps/driver/app/(tabs)/_layout.tsx (update)
- apps/driver/app/(tabs)/home/_layout.tsx (new)
- apps/driver/app/(tabs)/home/(booking)/_layout.tsx (new)
- apps/driver/app/(ride)/_layout.tsx (new)

 Screens

- apps/driver/app/(tabs)/home/index.tsx (replace)
- apps/driver/app/(tabs)/home/(booking)/request.tsx (new)
- apps/driver/app/(tabs)/bookings.tsx (new)
- apps/driver/app/(tabs)/earnings.tsx (new)
- apps/driver/app/(tabs)/profile/index.tsx (new)
- apps/driver/app/(ride)/pickup.tsx (new)
- apps/driver/app/(ride)/ongoing.tsx (new)
- apps/driver/app/(ride)/complete.tsx (new)

 Components

- apps/driver/src/components/driver/OnlineToggle.tsx
- apps/driver/src/components/driver/BookingRequestCard.tsx
- apps/driver/src/components/driver/ActiveBookingCard.tsx
- apps/driver/src/components/driver/TodayStatsCard.tsx
- apps/driver/src/components/driver/TripCard.tsx
- apps/driver/src/components/driver/RiderInfo.tsx

 ---
 Success Criteria

 ✅ Driver can go online/offline
 ✅ Driver receives booking requests via WebSocket
 ✅ Driver can accept/reject bookings
 ✅ Driver can navigate to pickup/dropoff
 ✅ Driver can update trip status (arrived, started, completed)
 ✅ Location tracking works in foreground and background
 ✅ Driver can view bookings and earnings
 ✅ Profile screen shows driver info
 ✅ External navigation works
 ✅ All API endpoints integrated
