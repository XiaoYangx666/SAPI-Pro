import { Player } from "@minecraft/server";
import {
    ActionFormData,
    ActionFormResponse,
    MessageFormData,
    MessageFormResponse,
    ModalFormData,
    ModalFormResponse,
} from "@minecraft/server-ui";
import { SAPIProFormContext } from "./form";

export type formDataType = ActionFormData | ModalFormData | MessageFormData;
export type formResponse = MessageFormResponse | ModalFormResponse | ActionFormResponse;

export type formResponseType<T extends formDataType> = T extends MessageFormData
    ? MessageFormResponse
    : T extends ModalFormData
      ? ModalFormResponse
      : T extends ActionFormData
        ? ActionFormResponse
        : never;

export interface contextArgs {
    [key: string]: any;
}

export interface openFormData {
    name: string;
    nameSpace: string;
    playerid: string;
    args?: contextArgs;
    delay: number;
}

export type FormBuilder<T extends formDataType, U extends contextArgs> = (
    player: Player,
    args: U
) => Promise<T> | T;

export type formBeforeBuild<T extends formDataType, U extends contextArgs> = (
    context: SAPIProFormContext<T, U>
) => void | Promise<void>;

export type formHandler<T extends formDataType, TArgs extends contextArgs> = (
    response: formResponseType<T>,
    context: SAPIProFormContext<T, TArgs>
) => void | Promise<void>;
