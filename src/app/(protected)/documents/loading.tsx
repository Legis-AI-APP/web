import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="bg-background">
            {/* Header Section */}
            <div className="bg-card/50">
                <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-4 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-6 w-64" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 max-w-7xl mx-auto space-y-6">
                {/* Search Section */}
                <div className="max-w-lg">
                    <Skeleton className="h-12 w-full" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-card/80 border-0 rounded-xl">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Documents List */}
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-card/80 border-0 rounded-xl">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                    <div className="flex items-start space-x-3">
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <Skeleton className="h-4 w-64" />
                                            <div className="space-y-0.5">
                                                <Skeleton className="h-3 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <div className="flex space-x-1.5">
                                            <Skeleton className="h-5 w-16" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                        <div className="flex space-x-1.5">
                                            <Skeleton className="h-7 w-7" />
                                            <Skeleton className="h-7 w-7" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
