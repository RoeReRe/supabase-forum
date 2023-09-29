import { useState } from "react";
import Dialog from "./Dialog";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supaClient } from "./supa-client";

export default function Login() {
    const [showModal, setShowModal] = useState(false);
    const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");

    return (
        <>
            <div className="flex m-4 place-items-center">
                <button
                    className="login-button"
                    onClick={() => {
                        setShowModal(true);
                        setAuthMode("sign_in");
                    }}
                >
                    Login
                </button>{" "}
                <span className="p-2">or</span>{" "}
                <button
                    className="login-button"
                    onClick={() => {
                        setShowModal(true);
                        setAuthMode("sign_up");
                    }}
                >
                    Sign up
                </button>     
            </div>
            <Dialog
                open={showModal}
                dialogStateChange={(open) => setShowModal(open)}
                contents={
                    <>
                        <Auth
                            supabaseClient={supaClient}
                            view={authMode}
                            providers={['google', 'discord']}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: '#0091FF',
                                            brandAccent: '#007FDF',
                                        },
                                    }
                                },
                                className: {
                                    container: "login-form-container",
                                    label: "login-form-label",
                                    button: "login-form-button",
                                    input: "login-form-input",
                                }
                            }}
                        />
                        <button onClick={() => setShowModal(false)}>Close</button>
                    </>
                }
            />
        </>
    );
}