# Integration Guide - Bryntum + AG Grid + Render + Postman

## 1. Bryntum Scheduler (Timetable View)

### Install
```bash
npm install @bryntum/scheduler @bryntum/scheduler-react
```

> Note: Bryntum requires a trial license. Get it free for 45 days at https://bryntum.com

### Key benefits for this project
- Drag & drop class slots
- Resource view (professors as resources)
- Conflict detection built-in
- Beautiful calendar/timeline UI

## 2. AG Grid (Faculty / Students / Allotment tables)

### Install
```bash
npm install ag-grid-react ag-grid-community
```

### Use for
- Faculty roster table
- Student lists
- Allotment matrix
- Analytics tables

## 3. Render Deployment

The `render.yaml` is already added.

1. Go to https://render.com
2. New → Blueprint
3. Connect this GitHub repo
4. Render will auto-detect `render.yaml`

## 4. Postman Collection

Import the file: `postman/TimeTable_API.postman_collection.json`

Set the `baseUrl` variable to your local or production URL.

---

Created using modern-dev-tools / paypal-ai-toolkit skill.
