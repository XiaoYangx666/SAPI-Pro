import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { SAPIProFormContext } from "./form";

export type formDataType = ActionFormData | ModalFormData | MessageFormData;
export type formResponse= MessageFormResponse|ModalFormResponse|ActionFormResponse;

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

export type FormBuilder<T extends formDataType> = (player:Player,args: contextArgs) => Promise<T> | T;

export type formBeforeBuild<T extends formDataType> = (context: SAPIProFormContext<T>) => void | Promise<void>;

export type formHandler<T extends formDataType> = (response: formResponseType<T>, context: SAPIProFormContext<T>) => void | Promise<void>;
