import Text from './Text';

const Tag = ({ children }) => {
    return (
        <div className="bg-[#BDB8AD] rounded-lg p-2">
            <div className='bg-secondary w-2 h-2 rounded-full' />
            <Text secondary tag noSpacing className="text-[#292621]">Peter Baltimore's Barbershop</Text>
        </div>
    )
}

export default Tag;