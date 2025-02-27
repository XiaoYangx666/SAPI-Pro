/** 非递归前序遍历 */
export function PreOrdertraverse(root, options) {
    const { getSubNodes, enter, ctx } = options;
    let T = root;
    const stack = [];
    while (stack.length != 0 || T) {
        while (T) {
            /** 访问命令 */
            const action = enter(T, ctx, stack);
            if (action == traverseAct.break)
                return;
            /** 访问完毕 */
            // 判断是否直接返回
            if (action == traverseAct.back) {
                T = undefined;
            }
            else {
                stack.push([T, 0]);
                const subNodes = getSubNodes(T);
                T = subNodes ? subNodes[0] : undefined;
            }
        }
        if (stack.length > 0) {
            const top = stack[stack.length - 1];
            const subNodes = getSubNodes(top[0]);
            if (top[1] < (subNodes?.length ?? 0) - 1) {
                T = subNodes[++top[1]];
            }
            else {
                stack.pop();
                T = undefined;
            }
        }
    }
    return ctx;
}
export var traverseAct;
(function (traverseAct) {
    traverseAct["break"] = "break";
    traverseAct["back"] = "back";
})(traverseAct || (traverseAct = {}));
