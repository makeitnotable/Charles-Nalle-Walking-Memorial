import Text from './Text';
import Button from './Button';
import Tag from './Tag';
const ComponentsLibrary = () => {
    return (
        <div className="p-8 mt-10 h-full">
            <Text h1>h1</Text>
            <Text h2>h2</Text>
            <Text h3>h3</Text>
            <Text>body</Text>
            <Text thin>thin</Text>

            <Tag />

            <div>
                <Text secondary h2 className="mb-4">H1 Variant</Text>
                <div className="space-y-4">
                    <Text secondary h1>Default H1</Text>
                    <Text secondary h1>1860</Text>

                </div>
            </div>

            <div>
                <Text h2 className="mb-4">H2 Variant</Text>
                <div className="space-y-4">
                    <Text h2>Default H2</Text>
                </div>
            </div>

            <div>
                <Text h2 className="mb-4">H3 Variant</Text>
                <div className="space-y-4">
                    <Text h3>Default H3</Text>
                </div>
            </div>

            <div>
                <Text h2 className="mb-4">Body Variant</Text>
                <div className="space-y-4">
                    <Text>Default body text</Text>
                </div>
            </div>

            <div>
                <Text h2 className="mb-4">Button Component</Text>
                <div className="space-y-4">
                    <Button onClick={() => alert('Default button clicked')}>
                        Enter Experience
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ComponentsLibrary;