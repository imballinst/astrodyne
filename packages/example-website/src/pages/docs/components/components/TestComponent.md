---
layout: ../../../../layouts/Layout.astro
---

## Components

### TestComponent

Renders a hello world text, the title, as well as the metadata.

## Types

### TestComponentProps

The props passed to TestComponent.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| title | string | The title of the component. This is NOT the component ID. |
| metadata | [Metadata](../../../types/helpers/types) | The metadata of the component. |
| information | [Metadata](../../../types/helpers/types) | **[Deprecated]** Deprecated since 1.11.1. Please use `metadata` field instead as this might be<br/>removed in the future.<br/><br/>The component information. |