import { formManager } from "./formManager";
import { contextArgs, formBeforeBuild, FormBuilder, formDataType, formHandler } from "./interface";
import { formStackManager, PlayerFormStack } from "./stackManager";

export interface SAPIProForm<T extends formDataType> {
    /**构建函数 */
    builder: FormBuilder<T>;
    /**在展示前运行，可用来处理验证或跳转 */
    beforeBuild?: formBeforeBuild<T>;
    /**处理函数 */
    handler: formHandler<T>;
}

export class SAPIProFormContext<T extends formDataType> {
    /**@internal 内部属性，勿改*/
    _form?: SAPIProForm<T>;
    /**@internal 内部属性，勿改 */
    willBuild: boolean;

    constructor(readonly args: contextArgs, private readonly stack: PlayerFormStack, form?: SAPIProForm<T>) {
        this._form = form;
        this.willBuild = true;
    }

    get player() {
        return this.stack.getPlayer();
    }

    /**打开表单 */
    push<T extends formDataType>(form: SAPIProForm<T>, args?: contextArgs, delay = 0) {
        this.willBuild = false;
        this.stack.push(args ?? {}, form as any);
        formManager._show(this.player, delay);
    }
    /**打开命名表单 */
    pushNamed(name: string, args?: contextArgs, delay = 0) {
        this.willBuild = false;
        this.stack.push(args ?? {});
        formManager._showNamed(this.player, name, delay);
    }
    /**返回上一个表单 */
    back(delay = 0) {
        this.willBuild = false;
        this.stack.pop();
        formManager._show(this.player, delay);
    }
    /**重新打开当前表单 */
    reopen(delay = 0) {
        this.willBuild = false;
        formManager._show(this.player, delay);
    }
    /**关闭所有表单 */
    close() {
        this.willBuild = false;
        formStackManager.resetStack(this.player);
    }
    /**替换当前表单为新的命名表单 */
    replace<T extends formDataType>(form: SAPIProForm<T>, args: contextArgs, delay = 0) {
        this.willBuild = false;
        this.stack.pop();
        this.stack.push(args, form as any);
        formManager._show(this.player, delay);
    }
    /**替换当前表单为新的命名表单 */
    replaceNamed(name: string, args: contextArgs, delay = 0) {
        this.willBuild = false;
        this.stack.pop();
        this.stack.push(args);
        formManager._showNamed(this.player, name, delay);
    }
    /**清空堆栈，并打开表单 */
    offAll<T extends formDataType>(form: SAPIProForm<T>, args: contextArgs, delay = 0) {
        this.willBuild = false;
        formStackManager.resetStack(this.player);
        this.push(form, args, delay);
    }
    /**清空堆栈，并打开命名表单 */
    offAllNamed(name: string, args?: contextArgs, delay = 0) {
        this.willBuild = false;
        this.pushNamed(name, args, delay);
    }
}
