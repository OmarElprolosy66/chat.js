# chat.js Frontend

A fast, highly responsive, and beautiful real-time chat client built with React, TypeScript, and Vite.

This client interfaces with the [chat.js Backend](../README.md) WebSocket and REST APIs, offering native-like chat flows on both desktop and mobile web browsers.

---

## Key Features

- **Real-Time Client Messaging**: Real-time communication powered by native WebSockets with automatic visibility-state reconnection.
- **Dynamic Contact Management**: Instantly resolve database profile details for unadded message senders.
- **Active Blocking System**: Block and unblock contacts dynamically, immediately updating sidebar layouts and updating relationships.
- **Visual Viewport Keyboard Alignment**: Fully anchors layout elements on mobile devices. Uses the Visual Viewport API to size layout views above virtual keyboards, preventing layout offsets and input shifts.
- **On-Demand History Sync**: Automatically merges local optimistic messages with full backend history on load or context change.
- **Clean Modern Design**: Rich dark glassmorphic styling utilizing custom CSS tokens, smooth micro-animations, and high-quality UI iconography.

---

## Technology Stack

- **Framework**: React (v18)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS

---

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- A running [chat.js Backend](../README.md) instance

### Installation Steps

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `frontend` root folder:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_WS_URL=ws://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## License

This project is licensed under the terms of the GNU General Public License v3.0. See the [LICENSE](../LICENSE) file in the root of the repository for full details.
