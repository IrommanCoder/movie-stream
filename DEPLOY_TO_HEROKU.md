# Deployment Guide

## 1. Run Locally

To run the application locally with the new Python backend:

1.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Build the Frontend:**
    ```bash
    npm run build
    ```

3.  **Run the Full Stack (Frontend + Backend):**
    ```bash
    npm run dev:full
    ```
    *   This will start the Flask backend on port 5000 and the Vite dev server.
    *   Open `http://localhost:5173` (or whatever port Vite uses) to view the app.

## 2. Deploy to Heroku

1.  **Login to Heroku:**
    ```bash
    heroku login
    ```

2.  **Create a New App:**
    ```bash
    heroku create your-app-name
    ```

3.  **Add Buildpacks:**
    You need both Node.js (for building the frontend) and Python (for running the backend).
    ```bash
    heroku buildpacks:add heroku/nodejs
    heroku buildpacks:add heroku/python
    ```

4.  **Deploy:**
    ```bash
    git add .
    git commit -m "Prepare for Heroku deployment"
    git push heroku main
    ```
    *(Note: If your branch is `master`, use `git push heroku master`)*

5.  **Open the App:**
    ```bash
    heroku open
    ```

## Troubleshooting

*   **Build Fails:** Ensure `npm run build` works locally.
*   **Application Error:** Check logs with `heroku logs --tail`.
*   **Static Files Not Found:** Ensure the `dist` folder is being created and `app.py` is pointing to the correct relative path.
