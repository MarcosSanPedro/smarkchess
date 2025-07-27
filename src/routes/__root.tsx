import { Outlet, createRootRoute } from "@tanstack/react-router";

import Header from "../components/Header";

export const Route = createRootRoute({
  component: () => (
    // <div className="w-screen h-screen grid grid-rows-12 grid-cols-3 bg-blue-200">

    <div className="grid grid-cols-3 grid-rows-12 gap-0 w-screen h-screen">
      <div className="col-span-3 row-span-1 bg-primary">
        <Header className="text-white"/>
      </div>
      <div className="col-span-3 row-span-10 row-start-2">
        <Outlet />
      </div>
      <footer className="col-span-3 row-start-12 bg-primary">
      </footer>
    </div>

    // <div className="row-sp">

    // {/* </div> */}
    // <TanStackRouterDevtools />
    // </div>
  ),
});
