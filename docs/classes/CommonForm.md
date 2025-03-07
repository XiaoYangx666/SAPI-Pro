[**Documentation**](../README.md)

---

[Documentation](../globals.md) / CommonForm

# Class: CommonForm

常用模板表单

## Methods

### BodyInfoForm()

> `static` **BodyInfoForm**(`id`, `title`, `body`): `void`

注册一个简单的信息窗口

#### Parameters

##### id

`string`

##### title

`string`

标题

##### body

内容，可以是生成器

`string` | [formGenerator](../interfaces/formGenerator.md)\<`ActionFormData`\>

#### Returns

`void`

#### 示例

```typescript
CommonForm.BodyInfoForm("aichat.prompt", "AIChat系统提示词", (form, player, context) => {
    form.body(Prompts[Config.systemPrompt]);
});
```

---

### ButtonForm()

> `static` **ButtonForm**(`id`, `data`): `void`

常用的按钮表单

#### Parameters

##### id

`string`

##### data

[ButtonFormData](../interfaces/ButtonFormData.md)

#### Returns

`void`

---

### ButtonListForm()

> `static` **ButtonListForm**(`id`, `data`): `void`

按钮列表表单

#### Parameters

##### id

`string`

##### data

[ButtonListFormData](../interfaces/ButtonListFormData.md)

#### Returns

`void`

---

### SimpleMessageForm()

> `static` **SimpleMessageForm**(`id`, `data`): `void`

一个简单的提示窗口，仅含有两个按钮，

#### Parameters

##### id

`string`

##### data

[SimpleMessageFormData](../interfaces/SimpleMessageFormData.md)

#### Returns

`void`

```

```
