import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
function LoginModal({ loginReason}: { loginReason: string}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-24">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Please sign in to your account to {loginReason}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
