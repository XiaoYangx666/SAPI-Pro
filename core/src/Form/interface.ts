import { Player } from "@minecraft/server";
import {
    ActionFormData,
    ActionFormResponse,
    CustomForm,
    DataDrivenScreenClosedReason,
    MessageFormData,
    MessageFormResponse,
    ModalFormData,
    ModalFormResponse,
} from "@minecraft/server-ui";
import { SAPIProFormContext } from "./form";

/** 传统表单与 DDUI（CustomForm）都可以放进同一个表单栈 */
export type formDataType = ActionFormData | ModalFormData | MessageFormData | CustomForm;
export type formResponse = MessageFormResponse | ModalFormResponse | ActionFormResponse;

export type formResponseType<T extends formDataType> = T extends MessageFormData
    ? MessageFormResponse
    : T extends ModalFormData
      ? ModalFormResponse
      : T extends ActionFormData
        ? ActionFormResponse
        : T extends CustomForm
          ? DataDrivenScreenClosedReason
          : never;

export interface contextArgs {
    [key: string]: any;
}

/**
 * 任意表单（传统表单或 DDUI 页面）。
 *
 * 用于只关心“能入栈/能返回”、不关心具体响应类型的导航 API，
 * 避免把 `SAPIProForm<any>` 的响应联合类型传染给调用方。
 */
export interface FormLike<TArgs extends contextArgs = contextArgs> {
    builder(player: Player, args: TArgs, context: SAPIProFormContext<any, any>): any;
    handler(response: any, context: SAPIProFormContext<any, any>): any;
    beforeBuild?(context: SAPIProFormContext<any, any>): any;
    _ddui?: true;
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
    args: U,
    context: SAPIProFormContext<T, U>
) => Promise<T> | T;

export type formBeforeBuild<T extends formDataType, U extends contextArgs> = (
    context: SAPIProFormContext<T, U>
) => void | Promise<void>;

export type formHandler<T extends formDataType, TArgs extends contextArgs> = (
    response: formResponseType<T>,
    context: SAPIProFormContext<T, TArgs>
) => void | Promise<void>;

export type showData = { delay: number; name?: string };
