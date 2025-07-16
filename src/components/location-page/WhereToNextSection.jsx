import { Button } from '../Button';
import MapBox from '../map/MapBox';
import { LOCATIONS } from '../map/constants';

export default function WhereToNextSection({ data }) {
    return (
        <div className='space-y-4 p-4'>
            <div className='space-y-2'>
                <p className='text-[#F6F3EE] text-5xl font-["Martel_Sans"] font-semibold leading-[38px] tracking-[-1.5px]'>
                    {data.whereToNext.title.split(' ')[0]}
                    <br />
                    {data.whereToNext.title.split(' ').slice(1).join(' ')}
                </p>
                <p className='text-[#F6F3EE] ml-2 my-4 text-xs font-["Poppins"] font-medium leading-[18px]'>{data.whereToNext.number}</p>
            </div>

            <MapBox
                initialLocationName={LOCATIONS[1].name}
                height="300px"
                width="100%"
                className="rounded-3xl overflow-hidden mt-10 border-2 border-primary-6"
                interactive={false}
                showButtons={false}
            />
            <div className='flex w-flex-row justify-center items-center p-8'>
                <Button variant='filled'>
                    Get Directions
                </Button>
            </div>
        </div>
    );
} 