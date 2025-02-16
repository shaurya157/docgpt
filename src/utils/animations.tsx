import {useState} from "react";

import {motion} from "framer-motion";

export const DotAnimation = () => {
    const dotVariants = {
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.5 } },
        initial: { opacity: 0 },
    };

    // Stagger children animations
    const containerVariants = {
        animate: { transition: { staggerChildren: 0.5, staggerDirection: 1 } },
        exit: { transition: { staggerChildren: 0.5, staggerDirection: 1 } },
        initial: { transition: { staggerChildren: 0 } },
    };

    const [key, setKey] = useState(0);

    // ...
    return (
        <motion.div
            key={key}
            className="-ml-1 flex gap-x-0.5"
            onAnimationComplete={() => setKey((prevKey) => prevKey + 1)}
            animate="animate"
            exit="exit"
            initial="initial"
            variants={containerVariants}
        >
            {[...Array(3)].map((_, i) => (
                <motion.span key={i} variants={dotVariants}>
                    .
                </motion.span>
            ))}
        </motion.div>
    );
};
