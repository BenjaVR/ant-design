---
order: 4
title:
  zh-CN: 
  en-US: Extra Navigation Controls
---

## zh-CN



## en-US

A calendar component with extra navigation controls to go to the previous or next month, or to go to today.

```jsx
import { Calendar } from 'antd';

ReactDOM.render(
    <div>
        <div style={{ width: 300, border: '1px solid #d9d9d9', borderRadius: 4, margin: '10px 0' }}>
            <Calendar showPreviousNextButtons={true} showTodayButton={true} fullscreen={false} />
        </div>
        <hr />
        <Calendar showPreviousNextButtons={true} showTodayButton={true} />
    </div>,
    mountNode
);
```
