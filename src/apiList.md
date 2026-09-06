# MomTinder API List

All routers are mounted at `/` in `app.js`, so the endpoints below do not have an additional router prefix.

## authRouter

| Method  | Endpoint          | Purpose                              | Auth |
| ------- | ----------------- | ------------------------------------ | ---- |
| `POST`  | `/signUp`         | Create a user account                | No   |
| `POST`  | `/login`          | Log in and set the `token` cookie    | No   |
| `PATCH` | `/changePassword` | Change the logged-in user's password | Yes  |
| `POST`  | `/logout`         | Clear the `token` cookie             | No   |

### `/signUp` body

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "StrongPassword1!"
}
```

### `/changePassword` body

```json
{
  "password": "CurrentPassword1!",
  "updatedPassword": "NewPassword1!"
}
```

## profileRouter

| Method  | Endpoint              | Purpose                             | Auth |
| ------- | --------------------- | ----------------------------------- | ---- |
| `GET`   | `/user/profile`       | Get the logged-in user's profile    | Yes  |
| `PATCH` | `/user/updateProfile` | Update the logged-in user's profile | Yes  |

## requestRouter

| Method | Endpoint                             | Purpose                                   | Auth |
| ------ | ------------------------------------ | ----------------------------------------- | ---- |
| `POST` | `/request/send/:status/:toUserId`    | Send an `interested` or `ignored` request | Yes  |
| `POST` | `/request/review/:status/:requestId` | Accept or reject an interested request    | Yes  |

### Request route parameters

- `status` for sending: `interested` or `ignored`
- `status` for reviewing: `accepted` or `rejected`
- `toUserId`: ID of the user receiving the request
- `requestId`: ID of the connection request being reviewed

## userRouter

| Method | Endpoint                  | Purpose                                                      | Auth |
| ------ | ------------------------- | ------------------------------------------------------------ | ---- |
| `GET`  | `/user/requests/received` | Get incoming interested requests, with sender profiles       | Yes  |
| `GET`  | `/user/connections`       | Get accepted connections, returning the other user's profile | Yes  |
