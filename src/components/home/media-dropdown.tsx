import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ImageIcon, Plus, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import ReactPlayer from "react-player";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";

const MediaDropdown = () => {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);
  const sendImage = useMutation(api.messages.sendImage);
  const sendVideo = useMutation(api.messages.sendVideo);
  const me = useQuery(api.users.getMe);

  const { selectedConversation } = useConversationStore();

  const handleSendImage = async () => {
    setIsLoading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage!.type },
        body: selectedImage,
      });

      const { storageId } = await result.json();

      await sendImage({
        conversation: selectedConversation!._id,
        imgId: storageId,
        sender: me!._id,
      });

      setSelectedImage(null);
    } catch (err) {
      toast.error("Failed to send image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVideo = async () => {
    setIsLoading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedVideo!.type },
        body: selectedVideo,
      });

      const { storageId } = await result.json();

      await sendVideo({
        videoId: storageId,
        conversation: selectedConversation!._id,
        sender: me!._id,
      });

      setSelectedVideo(null);
    } catch (error) {
      toast.error("Failed to send video");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={imageInput}
        accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
        onChange={(e) => setSelectedImage(e.target.files![0])}
        hidden
      />

      <input
        type="file"
        ref={videoInput}
        accept="video/mp4"
        onChange={(e) => setSelectedVideo(e.target?.files![0])}
        hidden
      />

      {selectedImage && (
        <MediaImageDialog
          isOpen={selectedImage !== null}
          onClose={() => setSelectedImage(null)}
          selectedImage={selectedImage}
          isLoading={isLoading}
          handleSendImage={handleSendImage}
        />
      )}

      {selectedVideo && (
        <MediaVideoDialog
          isOpen={selectedVideo !== null}
          onClose={() => setSelectedVideo(null)}
          selectedVideo={selectedVideo}
          isLoading={isLoading}
          handleSendVideo={handleSendVideo}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Plus className="text-gray-600 dark:text-gray-400 cursor-pointer" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => imageInput.current!.click()}
          >
            <ImageIcon size={18} className="mr-1" /> Photo
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => videoInput.current!.click()}
          >
            <Video size={20} className="mr-1" /> Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
export default MediaDropdown;

type MediaImageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: File;
  isLoading: boolean;
  handleSendImage: () => void;
};

const MediaImageDialog = ({
  isOpen,
  onClose,
  selectedImage,
  isLoading,
  handleSendImage,
}: MediaImageDialogProps) => {
  const [renderedImage, setRenderedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const reader = new FileReader();
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] p-4 rounded-lg shadow-lg flex flex-col">
        <DialogDescription className="flex-1 overflow-y-auto max-h-[70vh] flex justify-center items-center">
          {renderedImage && (
            <div className="max-w-md rounded-md shadow overflow-hidden">
              <Image
                src={renderedImage}
                width={280}
                height={280}
                alt="selected image"
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogDescription>
        <Button
          className="w-full py-2 mt-4 hover:bg-indigo-200 rounded-md"
          disabled={isLoading}
          onClick={handleSendImage}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

type MediaVideoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedVideo: File;
  isLoading: boolean;
  handleSendVideo: () => void;
};

const MediaVideoDialog = ({
  isOpen,
  onClose,
  selectedVideo,
  isLoading,
  handleSendVideo,
}: MediaVideoDialogProps) => {
  const renderedVideo = URL.createObjectURL(selectedVideo);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-lg p-4 rounded-lg shadow-lg flex flex-col items-center">
        <DialogDescription className="mb-4 text-lg font-semibold" />
        {renderedVideo && (
          <div className="w-full max-w-md aspect-video rounded-md shadow overflow-hidden">
            <ReactPlayer
              url={renderedVideo}
              controls
              width="100%"
              height="100%"
            />
          </div>
        )}

        <Button
          className="w-full mt-4 py-2 hover:bg-indigo-200 rounded-md"
          disabled={isLoading}
          onClick={handleSendVideo}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
