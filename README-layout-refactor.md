# Encounter Lens Layout Refactor Bundle

Copy these files into your existing repo.

## Included

- client/src/layouts/PractitionerLayout.jsx
- client/src/components/Sidebar.jsx
- client/src/components/PageHeader.jsx
- client/src/components/ScheduleSection.jsx
- client/src/components/PatientSection.jsx
- client/src/pages/PractitionerHomePage.jsx
- client/src/styles/layout-refactor.css

## Apply

1. Copy files into matching paths.
2. Replace your existing PractitionerHomePage.jsx.
3. Either import the CSS in client/src/main.jsx:

```js
import "./styles/layout-refactor.css";
```

or copy the CSS into the bottom of client/src/index.css.

This should not change backend code or API files.
