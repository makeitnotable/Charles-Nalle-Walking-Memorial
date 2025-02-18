import React from 'react';
import { PropTypes } from 'prop-types';

const Text = ({
    children,
    h1,
    h2,
    h3,
    secondary = false,
    className = '',
    bold = false,
    noSpacing = true,
    thin = false,
    tag = false
}) => {
    const getVariant = () => {
        if (h1) return 'h1';
        if (h2) return 'h2';
        if (h3) return 'h3';
        if (thin) return 'thin';
        if (tag) return 'tag';
        return 'body';
    };

    const baseStyles = {
        h1: `text-4xl  ${noSpacing ? '' : 'leading-[1.1] mb-6'}`,
        h2: `text-3xl  ${noSpacing ? '' : 'leading-[1.2] mb-4 mt-8'}`,
        h3: `text-2xl  ${noSpacing ? '' : 'leading-[1.3] mb-3 mt-6'}`,
        body: `text-base ${noSpacing ? '' : 'leading-[1.75] mb-4'}`,
        thin: `text-base font-thin ${noSpacing ? '' : 'leading-[1.75] mb-4'}`,
        tag: `text-sm ${noSpacing ? '' : 'leading-[1.75] mb-4'}`
    };

    const textColor = secondary ? 'text-text-secondary' : 'text-text-primary';

    const variant = getVariant();
    const Component = variant === 'body' ? 'p' : variant;

    return (
        <Component
            className={`${baseStyles[variant]} ${textColor} ${bold ? 'font-bold' : ''} ${className}`}
        >
            {children}
        </Component>
    );
};

Text.propTypes = {
    children: PropTypes.node.isRequired,
    h1: PropTypes.bool,
    h2: PropTypes.bool,
    h3: PropTypes.bool,
    secondary: PropTypes.bool,
    className: PropTypes.string,
    bold: PropTypes.bool,
    noSpacing: PropTypes.bool,
    thin: PropTypes.bool,
    tag: PropTypes.bool
};

Text.defaultProps = {
    h1: false,
    h2: false,
    h3: false,
    secondary: false,
    className: '',
    bold: false,
    noSpacing: false,
    thin: false,
    tag: false
};

export default Text;
