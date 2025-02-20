// The provided Node.js code demonstrates how to create a basic animation using the Framer Motion library in a React application. 

// Step 1: Install the Framer Motion package using npm
// npm install framer-motion

// Step 2: Create a React component called ExampleAnimation using Framer Motion
import React from 'react';
import { motion } from 'framer-motion';

// ExampleAnimation component to animate the opacity of a div based on the isVisible prop
const ExampleAnimation = ({ isVisible }) => {
    return (
        <motion.div 
            animate={{ opacity: isVisible ? 1 : 0 }} // Animation effect to change opacity
            transition={{ duration: 1 }} // Set animation duration to 1 second
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

export default ExampleAnimation;

// Step 3: Use the ExampleAnimation component within a React App
// React app to toggle the visibility of the animation
// Import ExampleAnimation component
import ExampleAnimation from './ExampleAnimation';

function App() {
    const [isVisible, setIsVisible] = React.useState(true); // State to track visibility

    return (
        <div>
            <button onClick={() => setIsVisible(!isVisible)}>
                Toggle Animation
            </button>
            <ExampleAnimation isVisible={isVisible} /> // Render animated component
        </div>
    );
}

export default App;
