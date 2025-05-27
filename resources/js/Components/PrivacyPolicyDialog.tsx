import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import axios from 'axios';
import { toast } from 'sonner';
import { router } from "@inertiajs/react";

interface Props {
  open: boolean;
  onAccept: () => void;
}

export function PrivacyPolicyDialog({ open, onAccept }: Props) {
  const handleAccept = async () => {
    try {
      await axios.post('/privacy-policy/accept');
      toast.success('Privacy policy accepted');
      onAccept();
    } catch (error) {
      toast.error('Failed to accept privacy policy');
    }
  };
  const handleDecline = () => {
    router.post('/logout');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Welcome to ITAM360</DialogTitle>
          <DialogDescription>
            We collect and retain data about your business, to use our system please review and accept our privacy policy.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">Effective Date: 17 April 2025<br />Last Updated: 17 April 2025</p>
            
            <p>PC4 Recycling ("we", "our", or "us") is committed to protecting the privacy and personal data of our users. This Privacy Policy outlines how we collect, use, store, and share information through our portal, which is powered by ITAM360 Limited.</p>
            
            <h3 className="font-bold">1. Who We Are</h3>
            <p>PC4 Recycling Ltd is the primary controller of your data when using this portal.<br />
            ITAM360 Limited provides the underlying technology and may act as a data processor in accordance with our instructions.</p>
            
            <h3 className="font-bold">2. Information We Collect</h3>
            <p>We may collect and process the following data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Business Contact Details: Name, email address, job title, company name, and phone number.</li>
              <li>Account Information: Login credentials, user roles, and permissions.</li>
              <li>Asset Information: Device serial numbers, asset tags, status updates, collection logs, and valuation data.</li>
              <li>Usage Data: IP addresses, device/browser info, access times, and interaction logs.</li>
              <li>Communications: Messages or notes submitted through the portal or via support requests.</li>
            </ul>

            <h3 className="font-bold">3. How We Use Your Information</h3>
            <p>We use your data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To manage user accounts and access control.</li>
              <li>To track the status and lifecycle of IT assets.</li>
              <li>To generate reports and compliance records.</li>
              <li>To respond to customer service requests or technical support.</li>
              <li>To ensure system security and prevent misuse.</li>
            </ul>

            <h3 className="font-bold">4. Legal Basis for Processing</h3>
            <p>We process your personal data on the basis of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Legitimate interest – to operate and improve our services.</li>
              <li>Contractual necessity – when entering into or performing a contract.</li>
              <li>Legal obligation – for compliance with applicable laws.</li>
            </ul>

            <h3 className="font-bold">5. Sharing Your Information</h3>
            <p>We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ITAM360 Limited, our trusted technology provider, acting as a data processor.</li>
              <li>Service Providers, where necessary for hosting, support, and maintenance.</li>
              <li>Legal Authorities, where required by law or to protect our rights.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h3 className="font-bold">6. Data Retention</h3>
            <p>We retain personal data only as long as necessary for the purposes outlined in this policy, or as required by law or contractual obligations.</p>

            <h3 className="font-bold">7. Security</h3>
            <p>We implement appropriate technical and organisational measures to safeguard personal data. This includes encrypted data transmission, role-based access controls, and regular security audits by ITAM360 Limited.</p>

            <h3 className="font-bold">8. Your Rights</h3>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request erasure ("right to be forgotten")</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
            </ul>
            <p>To exercise these rights, contact us at info@pc4recycling.co.uk.</p>

            <h3 className="font-bold">9. Third-Party Links</h3>
            <p>This portal may contain links to external sites (e.g. ITAM360.co.uk). We are not responsible for the privacy practices of these sites.</p>

            <h3 className="font-bold">10. Contact Us</h3>
            <p>If you have any questions or concerns about this Privacy Policy, contact:</p>
            <p>PC4 Recycling Ltd<br />
            Email: info@pc4recycling.co.uk<br />
            Website: https://www.pc4recycling.co.uk</p>
          </div>
        </ScrollArea>
        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={handleDecline}>
            Do Not Accept
          </Button>
          <Button onClick={handleAccept}>Accept Privacy Policy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}