import type { Player } from "@minecraft/server";
import {
    contextArgs,
    formBeforeBuild,
    FormBuilder,
    formDataType,
    FormLike,
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
    /**@internal DDUI 页面标记：CustomForm.show() 不需要 player 参数 */
    _ddui?: true;
}

export class SAPIProFormContext<T extends formDataType, U extends contextArgs> {
    /**@internal 内部属性，勿改*/
    _form?: FormLike<any>;
    /**@internal 内部属性，勿改 */
    _willBuild: boolean;
    /**@internal 内部属性，勿改 */
    _showData?: showData;
    /**
     * 打开本页的玩家。
     *
     * 上下文**不持有** `PlayerFormStack` 引用：导航时按玩家从全局表取。
     * 否则 `stack[] -> context -> stack` 会成环，运行时不会主动回收引用环，
     * 每次关闭页面都会把 context 和它的 args 一起留在内存里。
     */
    readonly player: Player;
    /** 当前表单所在栈的身份；只存数字，避免反向持有栈对象形成引用环。 */
    private readonly stackInstanceId: number;

    constructor(
        readonly args: U,
        stack: PlayerFormStack,
        form?: FormLike<any>
    ) {
        this.player = stack.getPlayer();
        this.stackInstanceId = stack.instanceId;
        this._form = form;
        this._willBuild = true;
        this._showData = undefined;
    }

    /** @internal 当前玩家的表单栈（按需获取，绝不反向持有） */
    private get stack() {
        const current = formStackManager.getStack(this.player);
        // 旧异步 handler / beforeBuild 不得修改后来新开的页面，
        // 历史页面还在栈中、但已不是栈顶时也不得抢占前台导航。
        return current?.instanceId === this.stackInstanceId && current.getTop() === this
            ? current
            : undefined;
    }

    /**@internal 表单栈深度（DDUI 判断是否还有上一页） */
    get depth() {
        return this.stack?.depth ?? 0;
    }

    /**打开表单 */
    push<TArgs extends contextArgs>(form: FormLike<TArgs>, args?: NoInfer<TArgs>, delay = 0) {
        this._willBuild = false;
        this._showData = { delay };
        this.stack?.push(args ?? {}, form);
    }
    /**打开命名表单 */
    pushNamed(name: string, args?: contextArgs, delay = 0) {
        this._willBuild = false;
        this.stack?.push(args ?? {});
        this._showData = { delay, name };
    }
    /**返回上一个表单 */
    back(delay = 0) {
        this._willBuild = false;
        this.stack?.pop();
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
        if (this.stack) formStackManager.resetStack(this.player);
    }
    /**替换当前表单为新的命名表单 */
    replace<TArgs extends contextArgs>(form: FormLike<TArgs>, args?: NoInfer<TArgs>, delay = 0) {
        this._willBuild = false;
        const stack = this.stack;
        stack?.pop();
        stack?.push(args ?? {}, form);
        this._showData = { delay };
    }
    /**替换当前表单为新的命名表单 */
    replaceNamed(name: string, args?: contextArgs, delay = 0) {
        this._willBuild = false;
        const stack = this.stack;
        stack?.pop();
        stack?.push(args ?? {});
        this._showData = { delay, name };
    }
    /**清空堆栈，并打开表单 */
    offAll<TArgs extends contextArgs>(form: FormLike<TArgs>, args?: NoInfer<TArgs>, delay = 0) {
        const stack = this.stack;
        if (!stack) return;
        this._willBuild = false;
        stack.clear();
        stack.push(args ?? {}, form);
        this._showData = { delay };
    }
    /**清空堆栈，并打开命名表单 */
    offAllNamed(name: string, args?: contextArgs, delay = 0) {
        const stack = this.stack;
        if (!stack) return;
        this._willBuild = false;
        stack.clear();
        stack.push(args ?? {});
        this._showData = { delay, name };
    }
    /**一直返回到指定页 */
    until(form: FormLike<any>, delay = 0) {
        this._willBuild = false;
        const stack = this.stack;
        let top = stack?.getTop();
        while (stack && top?._form && top._form !== form) {
            stack.pop();
            top = stack.getTop();
        }
        this._showData = { delay };
    }
    /**一直返回到指定页并打开新页 */
    offUntil<TArgs extends contextArgs>(
        form: FormLike<any>,
        newForm: FormLike<TArgs>,
        args?: NoInfer<TArgs>,
        delay = 0
    ) {
        this._willBuild = false;
        const stack = this.stack;
        let top = stack?.getTop();
        while (stack && top?._form && top._form !== form) {
            stack.pop();
            top = stack.getTop();
        }
        stack?.push(args ?? {}, newForm);
        this._showData = { delay };
    }
}
