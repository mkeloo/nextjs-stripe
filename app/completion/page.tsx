'use client'

function CompletionPage() {

    return (
        <div className="flex flex-col items-center justify-center ">
            <h1 className="text-4xl font-bold text-slate-950 my-10">Thank you!</h1>
            <a href="/" className="text-lg font-bold text-center bg-purple-700 text-white px-8 py-4 rounded-xl">home</a>
            <div id="messages" role="alert"></div>
        </div>
    );
}

export default CompletionPage;
