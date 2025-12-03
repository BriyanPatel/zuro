import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 overflow-hidden group";
  
  const variants = {
    primary: "text-white bg-white/10 border border-white/10 hover:border-white/20 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]",
    secondary: "text-zinc-400 hover:text-white bg-transparent hover:bg-white/5",
    ghost: "text-zinc-400 hover:text-white"
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Shimmer Effect for Primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      )}
      
      <span className="relative z-20 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};