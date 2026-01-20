import Share from '../Share';

export default function FooterSection() {
    return (
        <div className='mx-4 md:mx-10 lg:mx-30'>
            {/* Mobile: unstacked variant */}
            <div className='lg:hidden'>
                <Share variant='default' id="mobile-share" />
            </div>
            {/* Desktop: default variant */}
            <div className='hidden lg:block'>
                <Share variant='unstacked' id="desktop-share" />
            </div>
        </div>
    );
}

