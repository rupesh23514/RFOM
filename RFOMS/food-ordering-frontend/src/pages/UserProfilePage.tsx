import { useGetMyUser, useUpdateMyUser } from "@/api/MyUserApi";
import UserProfileForm from "@/forms/user-profile-form/UserProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Mail, MapPin, Shield } from "lucide-react";

const UserProfilePage = () => {
  const { currentUser, isLoading: isGetLoading } = useGetMyUser();
  const { updateUser, isLoading: isUpdateLoading } = useUpdateMyUser();

  if (isGetLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return <span>Unable to load user profile</span>;
  }

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-32" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
              {currentUser.image ? (
                <img
                  src={currentUser.image}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-2xl font-bold text-orange-600 bg-orange-50 w-full h-full flex items-center justify-center rounded-full">
                  {initials}
                </span>
              )}
            </div>
            {/* Name & meta */}
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.name || "Your Name"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                {currentUser.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {currentUser.email}
                  </span>
                )}
                {currentUser.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {currentUser.city}, {currentUser.country}
                  </span>
                )}
                <span className="flex items-center gap-1 capitalize">
                  <Shield className="w-3.5 h-3.5" />
                  {currentUser.role?.replace("_", " ") || "Customer"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Edit Form */}
      <Card>
        <CardContent className="pt-6">
          <UserProfileForm
            currentUser={currentUser}
            onSave={updateUser}
            isLoading={isUpdateLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
