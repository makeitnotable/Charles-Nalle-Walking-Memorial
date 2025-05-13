import { Link } from 'react-router';

const ColorSwatch = ({ colorClass, colorVar, label }) => {
    return (
        <div className="flex flex-col items-center mb-4">
            <div
                className={`w-16 h-16 rounded-md shadow-md mb-2 ${colorClass}`}
            ></div>
            <div className="text-sm text-center">
                <div className="font-bold">{label}</div>
                <div className="text-xs">{colorVar}</div>
            </div>
        </div>
    );
};

const ColorSection = ({ title, colors }) => (
    <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {colors.map((color) => (
                <ColorSwatch
                    key={color.var}
                    colorClass={color.class}
                    colorVar={color.var}
                    label={color.label}
                />
            ))}
        </div>
    </div>
);

const FontSection = () => (
    <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Typography</h3>
        <div className="font-sans">
            <p className="text-4xl mb-2">Martel Sans - 4xl</p>
            <p className="text-2xl mb-2">Martel Sans - 2xl</p>
            <p className="text-xl mb-2">Martel Sans - xl</p>
            <p className="text-base mb-2">Martel Sans - base</p>
            <p className="text-sm mb-2">Martel Sans - sm</p>
        </div>
    </div>
);

const BrandingPage = () => {

    const primaryColors = [
        { class: "bg-primary-1", var: "--color-primary-1", label: "Primary 1" },
        { class: "bg-primary-2", var: "--color-primary-2", label: "Primary 2" },
        { class: "bg-primary-3", var: "--color-primary-3", label: "Primary 3" },
        { class: "bg-primary-4", var: "--color-primary-4", label: "Primary 4" },
        { class: "bg-primary-5", var: "--color-primary-5", label: "Primary 5" },
        { class: "bg-primary-6", var: "--color-primary-6", label: "Primary 6" },
        { class: "bg-primary-7", var: "--color-primary-7", label: "Primary 7" },
        { class: "bg-primary-8", var: "--color-primary-8", label: "Primary 8" },
        { class: "bg-primary-9", var: "--color-primary-9", label: "Primary 9" },
        { class: "bg-primary-10", var: "--color-primary-10", label: "Primary 10" },
        { class: "bg-primary-11", var: "--color-primary-11", label: "Primary 11" },
        { class: "bg-primary-12", var: "--color-primary-12", label: "Primary 12" },
    ];

    const secondaryColors = [
        { class: "bg-secondary-1", var: "--color-secondary-1", label: "Secondary 1" },
        { class: "bg-secondary-2", var: "--color-secondary-2", label: "Secondary 2" },
        { class: "bg-secondary-3", var: "--color-secondary-3", label: "Secondary 3" },
        { class: "bg-secondary-4", var: "--color-secondary-4", label: "Secondary 4" },
        { class: "bg-secondary-5", var: "--color-secondary-5", label: "Secondary 5" },
        { class: "bg-secondary-6", var: "--color-secondary-6", label: "Secondary 6" },
        { class: "bg-secondary-7", var: "--color-secondary-7", label: "Secondary 7" },
        { class: "bg-secondary-8", var: "--color-secondary-8", label: "Secondary 8" },
        { class: "bg-secondary-9", var: "--color-secondary-9", label: "Secondary 9" },
        { class: "bg-secondary-10", var: "--color-secondary-10", label: "Secondary 10" },
        { class: "bg-secondary-11", var: "--color-secondary-11", label: "Secondary 11" },
        { class: "bg-secondary-12", var: "--color-secondary-12", label: "Secondary 12" },
    ];

    const tertiaryColors = [
        { class: "bg-tertiary-1", var: "--color-tertiary-1", label: "Tertiary 1" },
        { class: "bg-tertiary-2", var: "--color-tertiary-2", label: "Tertiary 2" },
        { class: "bg-tertiary-3", var: "--color-tertiary-3", label: "Tertiary 3" },
        { class: "bg-tertiary-4", var: "--color-tertiary-4", label: "Tertiary 4" },
        { class: "bg-tertiary-5", var: "--color-tertiary-5", label: "Tertiary 5" },
        { class: "bg-tertiary-6", var: "--color-tertiary-6", label: "Tertiary 6" },
        { class: "bg-tertiary-7", var: "--color-tertiary-7", label: "Tertiary 7" },
        { class: "bg-tertiary-8", var: "--color-tertiary-8", label: "Tertiary 8" },
        { class: "bg-tertiary-9", var: "--color-tertiary-9", label: "Tertiary 9" },
        { class: "bg-tertiary-10", var: "--color-tertiary-10", label: "Tertiary 10" },
        { class: "bg-tertiary-11", var: "--color-tertiary-11", label: "Tertiary 11" },
        { class: "bg-tertiary-12", var: "--color-tertiary-12", label: "Tertiary 12" },
    ];

    const grayColors = [
        { class: "bg-gray-1", var: "--color-gray-1", label: "Gray 1" },
        { class: "bg-gray-2", var: "--color-gray-2", label: "Gray 2" },
        { class: "bg-gray-3", var: "--color-gray-3", label: "Gray 3" },
        { class: "bg-gray-4", var: "--color-gray-4", label: "Gray 4" },
        { class: "bg-gray-5", var: "--color-gray-5", label: "Gray 5" },
        { class: "bg-gray-6", var: "--color-gray-6", label: "Gray 6" },
        { class: "bg-gray-7", var: "--color-gray-7", label: "Gray 7" },
        { class: "bg-gray-8", var: "--color-gray-8", label: "Gray 8" },
        { class: "bg-gray-9", var: "--color-gray-9", label: "Gray 9" },
        { class: "bg-gray-10", var: "--color-gray-10", label: "Gray 10" },
        { class: "bg-gray-11", var: "--color-gray-11", label: "Gray 11" },
        { class: "bg-gray-12", var: "--color-gray-12", label: "Gray 12" },
    ];

    const neutralColors = [
        { class: "bg-neutral-1", var: "--color-neutral-1", label: "Neutral 1" },
        { class: "bg-neutral-2", var: "--color-neutral-2", label: "Neutral 2" },
        { class: "bg-neutral-3", var: "--color-neutral-3", label: "Neutral 3" },
        { class: "bg-neutral-4", var: "--color-neutral-4", label: "Neutral 4" },
        { class: "bg-neutral-5", var: "--color-neutral-5", label: "Neutral 5" },
        { class: "bg-neutral-6", var: "--color-neutral-6", label: "Neutral 6" },
        { class: "bg-neutral-7", var: "--color-neutral-7", label: "Neutral 7" },
        { class: "bg-neutral-8", var: "--color-neutral-8", label: "Neutral 8" },
        { class: "bg-neutral-9", var: "--color-neutral-9", label: "Neutral 9" },
        { class: "bg-neutral-10", var: "--color-neutral-10", label: "Neutral 10" },
        { class: "bg-neutral-11", var: "--color-neutral-11", label: "Neutral 11" },
        { class: "bg-neutral-12", var: "--color-neutral-12", label: "Neutral 12" },
    ];

    return (
        <div className="min-h-screen bg-black text-[#EFEFF2] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Brand Guidelines</h1>
                    <Link to="/" className="px-4 py-2 bg-[#A3A9BE] text-black rounded hover:opacity-90">
                        Back to Home
                    </Link>
                </div>

                <div className="bg-[#EFEFF2] rounded-lg shadow-lg p-6 mb-8 text-[#1C1F29]">
                    <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
                    <ColorSection title="Primary Colors" colors={primaryColors} />
                    <ColorSection title="Secondary Colors" colors={secondaryColors} />
                    <ColorSection title="Tertiary Colors" colors={tertiaryColors} />
                    <ColorSection title="Grayscale" colors={grayColors} />
                    <ColorSection title="Neutral Colors" colors={neutralColors} />
                </div>

                <div className="bg-[#EFEFF2] rounded-lg shadow-lg p-6 text-[#1C1F29]">
                    <h2 className="text-2xl font-bold mb-6">Typography</h2>
                    <FontSection />
                </div>
            </div>
        </div>
    );
};

export default BrandingPage; 