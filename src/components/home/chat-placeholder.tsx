import { Lock } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

const ChatPlaceHolder = () => {
	return (
		<div className='w-3/4 bg-gray-secondary flex flex-col items-center justify-center py-10'>
			<div className='flex flex-col items-center w-full justify-center py-10 gap-4'>
				<Image src={"/logo SVG - 6 colors tracing.svg"} alt='Hero' width={320} height={188} />
				<p className='text-3xl font-extralight mt-5 mb-2'>Safetalk</p>
				<p className='w-1/2 text-center text-gray-primary text-sm text-muted-foreground'>
          Real-Time Conversations, Real Connections
				</p>
			</div>
		</div>
	);
};
export default ChatPlaceHolder;