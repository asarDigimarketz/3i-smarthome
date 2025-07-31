import { Card, CardBody } from "@heroui/card";

const ProjectCardSkeleton = () => {
    return (
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                </div>

                {/* Service skeleton */}
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>

                {/* Amount skeleton */}
                <div className="h-6 bg-gray-200 rounded animate-pulse w-28 mb-4"></div>

                {/* Date skeleton */}
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-4"></div>

                {/* Address skeleton */}
                <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>

                {/* Progress skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-2 bg-gray-200 rounded-full animate-pulse w-20"></div>
                </div>
            </CardBody>
        </Card>
    );
};

export default ProjectCardSkeleton;