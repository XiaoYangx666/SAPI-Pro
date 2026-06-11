import {
    contextArgs,
    formBeforeBuild,
    FormBuilder,
    formDataType,
    formHandler,
    showData,
} from "./interface";
import { formStackManager, PlayerFormStack } from "./stackManager";

export interface SAPIProForm<T extends formDataType, U extends contextArgs = contextArgs> {
    /**构建函数 */
    builder: FormBuilder<T, U>;
    /**在展示前运行，可用来处理验证或跳转 */
    beforeBuild?: formBeforeBuild<T, U>;
    /**处理函数 */
    handler: formHandler<T, U>;
}

export class SAPIProFormContext<T extends formDataType, U extends contextArgs> {
    /**@internal 内部属性，勿改*/
    _form?: SAPIProForm<T, U>;
    /**@internal 内部属性，勿改 */
    _willBuild: boolean;
    /**@internal 内部属性，勿改 */
    _showData?: showData;

    constructor(
        readonly args: U,
        private readonly stack: PlayerFormStack,
        form?: SAPIProForm<T, U>
    ) {
        this._form = form;
        this._willBuild = true;
        this._showData = undefined;
    }

    get player() {
        return this.stack.getPlayer();
    }

    /**打开表单 */
    push<T extends formDataType, TArgs extends contextArgs>(
        form: SAPIProForm<T, TArgs>,
        args?: NoInfer<TArgs>,
        delay = 0
    ) {
        this._willBuild = false;
        this._showData = { delay };
        this.stack.push(args ?? {}, form);
    }
    /**打开命名表单 */
    pushNamed(name: string, args?: contextArgs, delay = 0) {
        this._willBuild = false;
        this.stack.push(args ?? {});
        this._showData = { delay, name };
    }
    /**返回上一个表单 */
    back(delay = 0) {
        this._willBuild = false;
        this.stack.pop();
        this._showData = { delay };
    }
    /**重新打开当前表单 */
    reopen(delay = 0) {
        this._willBuild = false;
        this._showData = { delay };
    }
    /**关闭所有表单 */
    close() {
        this._willBuild = false;
        formStackManager.resetStack(this.player);
    }
    /**替换当前表单为新的命名表单 */
    replace<T extends formDataType, TArgs extends contextArgs>(
        form: SAPIProForm<T, TArgs>,
        args?: NoInfer<TArgs>,
        delay = 0
    ) {
        this._willBuild = false;
        this.stack.pop();
        this.stack.push(args ?? {}, form as any);
        this._showData = { delay };
    }
    /**替换当前表单为新的命名表单 */
    replaceNamed(name: string, args?: contextArgs, delay = 0) {
        this._willBuild = false;
        this.stack.pop();
        this.stack.push(args ?? {});
        this._showData = { delay, name };
    }
    /**清空堆栈，并打开表单 */
    offAll<T extends formDataType, TArgs extends contextArgs>(
        form: SAPIProForm<T, TArgs>,
        args?: NoInfer<TArgs>,
        delay = 0
    ) {
        this._willBuild = false;
        this.stack.clear();
        this.push(form, args, delay);
    }
    /**清空堆栈，并打开命名表单 */
    offAllNamed(name: string, args?: contextArgs, delay = 0) {
        this._willBuild = false;
        this.stack.clear();
        this.pushNamed(name, args, delay);
    }
    /**一直返回到指定页 */
    until<T extends formDataType, TArgs extends contextArgs>(
        form: SAPIProForm<T, TArgs>,
        delay = 0
    ) {
        this._willBuild = false;
        let top = this.stack.getTop();
        while (top?._form && top._form !== form) {
            this.stack.pop();
            top = this.stack.getTop();
        }
        this._showData = { delay };
    }
    /**一直返回到指定页并打开新页 */
    offUntil<T extends formDataType, TArgs extends contextArgs>(
        form: SAPIProForm<any, any>,
        newForm: SAPIProForm<T, TArgs>,
        args?: NoInfer<TArgs>,
        delay = 0
    ) {
        this._willBuild = false;
        let top = this.stack.getTop();
        while (top?._form && top._form !== form) {
            this.stack.pop();
            top = this.stack.getTop();
        }
        this.stack.push(args ?? {}, newForm);
        this._showData = { delay };
    }
}
