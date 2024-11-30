import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { EmojiPicker } from "../emoji-picker";
import { Send } from "lucide-react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Input } from "../ui/input";
const formSchema = z.object({
  content: z.string().min(1),
});
interface ChatInputProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | undefined;
  isAdmin: boolean;
  userId: string;
}

export const ChatInput = ({ socket, isAdmin, userId }: ChatInputProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (socket) {
      socket.emit("send_message", {
        userId,
        content: values.content,
        isAdmin,
      });
      form.reset();
    }
  };
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="border-t p-3 bg-white flex items-center"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex items-center space-x-3 w-full">
                    <Input placeholder="Nhắn tin" {...field} />
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value} ${emoji}`)
                      }
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="ml-2 w-14 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            <Send />
          </Button>
        </form>
      </Form>
    </div>
  );
};