// Step 1: Install necessary package with npm
// npm install framer-motion

// Step 2: Basic setup for a React component using Framer Motion
import React from 'react';
import { motion } from 'framer-motion';

const ExampleAnimation = ({ isVisible }) => {
    return (
        <motion.div 
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1 }}
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

// Step 3: Usage in a React App
// import ExampleAnimation from './ExampleAnimation';

// function App() {
//     const [isVisible, setIsVisible] = React.useState(true);

//     return (
//         <div>
//             <button onClick={() => setIsVisible(!isVisible)}>
//                 Toggle Animation
//             </button>
//             <ExampleAnimation isVisible={isVisible} />
//         </div>
//     );
// }

// export default App;