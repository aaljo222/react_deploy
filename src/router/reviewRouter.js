import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { SyncLoader } from 'react-spinners'

const Loading = <div><SyncLoader /></div>
const ProductReviewList = lazy(() => import("../pages/review/ProductReviewPage"))
const TourReviewList = lazy(() => import("../pages/review/TourReviewPage"))

const reviewRouter = () => {
  return [
    {
      path: "products/list",
      element: <Suspense fallback={Loading}><ProductReviewList /></Suspense>
    },
    {
      path: "",
      element: <Navigate replace to="/review/products/list" />
    },
    {
      path: "tours/list",
      element: <Suspense fallback={Loading}><TourReviewList /></Suspense>
    },
  ]
}

export default reviewRouter