import { useLocation, Link } from "react-router-dom";
import { Button } from "./ui/button";
import LoadingButton from "./LoadingButton";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import UserProfileForm, {
  UserFormData,
} from "@/forms/user-profile-form/UserProfileForm";
import { useGetMyUser } from "@/api/MyUserApi";
import { useAppContext } from "@/contexts/AppContext";
import { LogIn, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";

type Props = {
  onCheckout: (userFormData: UserFormData) => void;
  disabled: boolean;
  isLoading: boolean;
};

const CheckoutButton = ({ onCheckout, disabled, isLoading }: Props) => {
  const { isLoggedIn } = useAppContext();
  const { pathname } = useLocation();
  const { currentUser, isLoading: isGetUserLoading } = useGetMyUser();

  if (!isLoggedIn) {
    return (
      <Button
        asChild
        className="bg-orange-500 hover:bg-orange-600 flex-1 h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <Link to="/sign-in" state={{ from: { pathname } }} className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Log in to check out
        </Link>
      </Button>
    );
  }

  if (!currentUser || isLoading) {
    return <LoadingButton />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex-1 h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Proceed to Checkout
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px] md:min-w-[700px] bg-white p-0 overflow-hidden">
        {/* Checkout Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Secure Checkout</h2>
              <p className="text-sm text-white/80">
                Confirm your delivery details to continue
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <UserProfileForm
            currentUser={currentUser}
            onSave={onCheckout}
            isLoading={isGetUserLoading}
            title="Delivery Details"
            buttonText="Continue to Payment"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutButton;
