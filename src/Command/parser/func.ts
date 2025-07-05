/** 非递归前序遍历 */
export function PreOrdertraverse<U>(root: U, options: PreOrdertraverseOptions<U>) {
    const { getSubNodes, enter, ctx } = options;
    let T: U | undefined = root;
    const stack: [U, number][] = [];
    while (stack.length != 0 || T) {
        while (T) {
            /** 访问命令 */
            const action = enter(T, ctx, stack);
            if (action == traverseAct.break) return;
            /** 访问完毕 */
            // 判断是否直接返回
            if (action == traverseAct.back) {
                T = undefined;
            } else {
                stack.push([T, 0]);
                const subNodes = getSubNodes(T);
                T = subNodes ? subNodes[0] : undefined;
            }
        }
        if (stack.length > 0) {
            const top = stack[stack.length - 1];
            const subNodes = getSubNodes(top[0]);
            if (top[1] < (subNodes?.length ?? 0) - 1) {
                T = subNodes![++top[1]];
            } else {
                stack.pop();
                T = undefined;
            }
        }
    }
    return ctx;
}

/** 遍历选项接口 */
export interface PreOrdertraverseOptions<U> {
    /** 获取子节点的函数 */
    getSubNodes: getSubNodesFunc<U>;
    /** 访问节点时的回调函数 */
    enter: enterNodeFunc<U>;
    /** 上下文对象（可选） */
    ctx?: any;
}

export enum traverseAct {
    break = "break",
    back = "back",
}
export type getSubNodesFunc<U> = (node: U) => U[] | undefined;
export type enterNodeFunc<U> = (node: U, ctx: any, stack: [U, number][]) => void | traverseAct;
