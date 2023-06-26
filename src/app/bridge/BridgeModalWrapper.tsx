"use client";
import { ComponentType, LazyExoticComponent, Suspense, lazy } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useBridgeModal, useHideModal } from "../providers/BridgeModalProvider";
import Loading from "../loading";
import dynamic from "next/dynamic";

export type Component = {
  component: LazyExoticComponent<ComponentType<any>>;
  props: any;
};
export const BridgeModalWrapper = () => {
  const { show, withHeader, header, body, footer } = useBridgeModal();
  const hideModal = useHideModal();

  const getComponents = (components: string[]) => {
    return components
      ? components.map((c: any) => ({
          component: lazy(() => import(`../components/${c.path}`)),
          props: c.props,
        }))
      : [];
  };

  const Views = {
    stepper: dynamic(() => import("../components/ui/stepper")),
    progressModalHeader: dynamic(
      () => import("../components/modal/ProgressModal/ProgressModalHeader")
    ),
    modalHeaderWithIcon: dynamic(
      () => import("../components/modal/ModalHeaderWithIcon")
    ),
    transactionSubmittedModalHeader: dynamic(
      () =>
        import(
          "../components/modal/TransactionSubmittedModal/TransactionSubmittedModalHeader"
        )
    ),
  };

  const renderLoading = () => {
    return (
      <div className={"center w-full h-full"}>
        <Loading />
      </div>
    );
  };
  const renderComponents = (
    components: Component[],
    fallbackComponent?: any
  ) => {
    return components.length > 0
      ? components.map((c, i) => <c.component key={i} {...c.props} />)
      : fallbackComponent;
  };
  // Temporary fix for next/react dynamic imports https://github.com/vercel/next.js/issues/49382
  const headerComponents = getComponents(header.components);
  const bodyComponents = getComponents(body.components);
  const footerComponents = getComponents(footer.components);

  return (
    <Dialog open={show} onOpenChange={hideModal}>
      <DialogContent className="w-full">
        {withHeader && (
          <DialogHeader className="items-center">
            <Suspense fallback={renderLoading()}>
              {renderComponents(headerComponents)}
            </Suspense>
            {header.title && <DialogTitle>{header.title}</DialogTitle>}
          </DialogHeader>
        )}
        <Suspense fallback={renderLoading()}>
          {renderComponents(bodyComponents, <div>{body.text}</div>)}
        </Suspense>
        {footer.withButtons && (
          <DialogFooter>
            <Suspense fallback={renderLoading()}>
              {renderComponents(footerComponents)}
            </Suspense>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
