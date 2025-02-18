import React, { useState } from 'react';
import { Link } from 'react-router';
function Drawer() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    function toggleDrawer() {
        setIsDrawerOpen(!isDrawerOpen);
    }
    return (
        <>
            <nav className="fixed top-0 left-0 right-0 bg-background text-white p-4 z-50 border-b border-text-secondary">
                <div className="flex justify-between items-center">

                    <div>CNWM</div>
                    <button onClick={toggleDrawer}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>

                <div
                    className={`${isDrawerOpen ? 'block' : 'hidden'} bg-[#12110f]`}
                >
                    <nav className="pt-16 pl-4 pb-4">
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-text-primary hover:text-text-secondary" onClick={toggleDrawer}>
                                    Map
                                </Link>
                            </li>
                            <li>
                                <Link to="/bakery" className="text-text-primary hover:text-text-secondary" onClick={toggleDrawer}>
                                    Bakery
                                </Link>
                            </li>
                            <li>
                                <Link to="/bank" className="text-text-primary hover:text-text-secondary" onClick={toggleDrawer}>
                                    Bank
                                </Link>
                            </li>
                            <li>
                                <Link to="/mansion" className="text-text-primary hover:text-text-secondary" onClick={toggleDrawer}>
                                    Mansion
                                </Link>
                            </li>
                            <li>
                                <Link to="/ferry" className="text-text-primary hover:text-text-secondary" onClick={toggleDrawer}>
                                    Ferry
                                </Link>
                            </li>
                            <li>
                                <Link to="/barber" className="text-text-primary hover:text-text-secondary" onClick={toggleDrawer}>
                                    Barber
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </nav>
        </>
    );
}

export default Drawer; 