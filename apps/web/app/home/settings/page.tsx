export default async function Settings() {
    return (
      <div className="flex relative font-sans flex-col p-5 h-screen w-full">
        <h1 className="text-5xl font-bold">Settings</h1>
        <p className="text-lg">
            View and change your settings.
        </p>
        <div className="grid grid-cols-2 gap-4 grid-rows-auto relative flex-col h-full w-full overflow-scroll">
          <div className="flex flex-col justify-center items-center">
            <div className="text-xl font-medium mt-3 pb-4">
              Manage
            </div>
          </div>
        </div>
      </div>
    );
  }
  