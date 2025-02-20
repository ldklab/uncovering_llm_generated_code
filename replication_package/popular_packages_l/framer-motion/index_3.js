// Description:
// This code is a simple React component utilizing the Framer Motion library to animate a div's opacity based on a visibility toggle. It sets up the animation, applies styles for the animated element, and demonstrates how it can be used within a React application.

// Step 1: Install necessary package with npm
// npm install framer-motion

// Step 2: Import necessary modules from React and Framer Motion
import React from 'react';
import { motion } from 'framer-motion';

// Step 3: Define the ExampleAnimation component
const ExampleAnimation = ({ isVisible }) => {
    // The component accepts a prop "isVisible" to determine its opacity
    return (
        <motion.div 
            // Framer Motion is used here to animate the opacity based on the "isVisible" prop
            animate={{ opacity: isVisible ? 1 : 0 }}
            // The transition property defines how the animation should be timed
            transition={{ duration: 1 }}
            // Inline styles are set to define appearance and positioning
            style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#f00',
                margin: 'auto'
            }}
        >
            Animate Me!
        </motion.div>
    );
};

// Step 4: Export the component to be used in other parts of the application
export default ExampleAnimation;

// Step 5: Example usage in a React App
// Import ExampleAnimation component
// import ExampleAnimation from './ExampleAnimation';

// Define the App component
// function App() {
//     // React state to manage visibility toggle
//     const [isVisible, setIsVisible] = React.useState(true);

//     // Render a button and the ExampleAnimation component
//     return (
//         <div>
//             // Button to toggle visibility state
//             <button onClick={() => setIsVisible(!isVisible)}>
//                 Toggle Animation
//             </button>
//             // ExampleAnimation component with visibility state passed as prop
//             <ExampleAnimation isVisible={isVisible} />
//         </div>
//     );
// }

// Export the App component as default
// export default App;
