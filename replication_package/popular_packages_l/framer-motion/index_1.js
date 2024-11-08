// This code defines a React component using Framer Motion to animate a div's opacity.
// A button toggles the visibility of the animated div by altering its opacity using a motion.div component.

// Step 1: Install the necessary package with npm
// npm install framer-motion

// Import React and Framer Motion
import React from 'react';
import { motion } from 'framer-motion';

// Define the ExampleAnimation component
const ExampleAnimation = ({ isVisible }) => {
    return (
        // Use the motion.div component to animate the div's opacity based on the visibility prop
        <motion.div 
            animate={{ opacity: isVisible ? 1 : 0 }} // Animate opacity between 1 and 0
            transition={{ duration: 1 }} // Transition duration of 1 second
            style={{
                width: '100px', // Div width
                height: '100px', // Div height
                backgroundColor: '#f00', // Background color red
                margin: 'auto' // Center the div
            }}
        >
            Animate Me!
        </motion.div>
    );
};

export default ExampleAnimation; // Export the component

// Step 3: Usage in a React App

// Import the ExampleAnimation component
// import ExampleAnimation from './ExampleAnimation';

// Define the main App function
// function App() {
//     const [isVisible, setIsVisible] = React.useState(true); // Define a state to manage visibility

//     return (
//         <div>
//             <button onClick={() => setIsVisible(!isVisible)}> // On button click, toggle visibility
//                 Toggle Animation
//             </button>
//             <ExampleAnimation isVisible={isVisible} /> // Pass the visibility state as a prop
//         </div>
//     );
// }

// export default App; // Export the main App function
