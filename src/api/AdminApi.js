import { Children, useEffect, useState } from "react"
import jwtAxios from "../util/jwtUtil"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { getCookie } from "../util/cookieUtil"
import axios from "axios"

// const host = `http://localhost:8080/api`
const host = process.env.REACT_APP_API_BASE_URL;
console.log("Environment Variables:", process.env);
console.log("host:", host);
// const memberInfo = getCookie("member");

// // AccessToken 가져오기 함수
// const getAccessToken = () => {
//     const accessToken = localStorage.getItem("accessToken")
//     if (!accessToken) {
//         throw new Error("No access token")
//     }
//     return accessToken
// }

// 기본 헤더 설정 함수
// const getHeaders = (isMultipart = false) => {
//     // const { accessToken } = memberInfo;
//     const token = getAccessToken()
//     const headers = {
//         'Authorization': `Bearer ${token}`
//     }

//     headers['Content-Type'] = isMultipart ?
//         'multipart/form-data' : 'application/json'

//     return { headers }
// }

// JWT 인터셉터 설정
// jwtAxios.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response?.status === 403 ||
//             error.response?.data?.error === 'ERROR_ACCESS_TOKEN') {
//             localStorage.removeItem('accessToken')
//             window.location.href = '/login'
//         }
//         return Promise.reject(error)
//     }
// )

// 관리자 권한 체크
export const checkAdminRole = async () => {
    try {
        // localStorage 체크
        // const user = JSON.parse(localStorage.getItem("user"))
        // if (!user?.role[1] === "ADMIN" || "ROLE_ADMIN") {
        //     throw new Error("관리자 권한이 없습니다")
        // } else setRole("ADMIN")

        // const user = JSON.parse(localStorage.getItem("user"))
        // if (!role === "ADMIN" || "ROLE_ADMIN") {
        //     throw new Error("관리자 권한이 없습니다")
        // } 

        const memberInfo = getCookie("member")
        if (!memberInfo) {
            throw new Error("로그인이 필요합니다")
        }
        const parsedMemberInfo = typeof memberInfo === 'string'
            ? JSON.parse(memberInfo)
            : memberInfo;

        console.log("memberInfo:", memberInfo)
        console.log("parsed memberInfo:", parsedMemberInfo)

        if (!parsedMemberInfo.role ||
            !parsedMemberInfo.role.includes("ADMIN")) {
            throw new Error("관리자 권한이 없습니다")
        }

        // API 체크
        const res = await jwtAxios.get(`${host}/admin/check`, {
            timeout: 5000
        })

        console.log("권한 체크 응답", res) // 응답 확인 로그

        return res.data
    } catch (error) {
        // 네트워크 에러일 경우 localStorage 정보만으로 진행
        if (error.code?.status === 302) {
            console.warn("네트워크 에러, cookie 권한으로 진행");
            return { role: ["ADMIN"] }; // localStorage 검증이 이미 완료됨
        }

        throw error;
    }
}

// ADMIN 라우트
export const AdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        checkAdminRole()
            .then(() => setIsAdmin(true))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false))
    }, [navigate])

    if (loading) return <Loader2 />
    return isAdmin ? children : null
}

// Admin API 함수들
/* -------------------------- ORDER ------------------------------*/

export const fetchOrders = async () => {
    try {
        const res = await jwtAxios.get(`${host}/admin/order`)
        console.log("주문 체크 응답", res)
        return res.data
    } catch (error) {
        console.log("주문 체크 오류", error)
        throw error
    }
}

/* -------------------------- PRODUCT ------------------------------*/

// export const postProduct = async (product) => {
//     const header = { header: { "Content-Type": "multipart/form-data" } }
//     const res = await jwtAxios.post(`${host}/product`, product, header)
//     return res.data
// }

export const adminProductList = async ({ page, size, keyword = "", type = "t" }) => {
    try {
        const response = await jwtAxios.get(`${host}/admin/product`, {
            params: { page, size, keyword, type }
        });

        // 응답 데이터 검증
        if (!response || !response.data) {
            throw new Error('응답 데이터가 없습니다');
        }

        console.log("API 응답 상태:", response.status);
        console.log("API 응답 데이터:", response.data);

        return response.data;

    } catch (error) {
        // axios 에러인 경우
        if (error.response) {
            console.error('[API 에러]');
            console.error('상태:', error.response.status);
            console.error('데이터:', error.response.data);
            console.error('헤더:', error.response.headers);
        }
        // 요청 설정 에러인 경우
        else if (error.request) {
            console.error('[요청 에러]', error.request);
        }
        // 기타 에러
        else {
            console.error('[기타 에러]', error.message);
        }

        // 사용자 정의 에러 객체 throw
        throw {
            message: '상품 목록을 불러오는데 실패했습니다',
            status: error.response?.status,
            data: error.response?.data,
            originalError: error
        };
    }
};

export const getProduct = async (pno) => {
    const res = await jwtAxios.get(`${host}/admin/product/${pno}`)
    return res.data
}

// export const getProductImage = async (fileName) => {
//     const res = await jwtAxios.get(`${host}/admin/product/image/${fileName}`)
//     return res.data
// }

// 이미지 URL을 생성하는 함수 추가
// URL 로 저장하기 때문에 upload 폴더에 저장되지 않고 바로 접근 가능 (서로 장단점이 있음)
export const getImage = async (fileName) => {
    if (!fileName) return null;
    try {
        const response = await jwtAxios.get(`${host}/product/image/${fileName}`);
        return response
    } catch (error) {
        console.error('이미지 접근 권한 없음:', error);
        return null;
    }
};

export const deleteImage = async (fileName) => {
    try {
        const response = await jwtAxios.delete(
            `${host}/admin/product/image/${fileName}`
        )
        return response;
    } catch (err) {
        console.error('이미지 삭제 실패 : ', err)
        throw err
    }
}

export const addProduct = async (formData) => {
    try {

        // jwtAxios 사용
        const response = await jwtAxios.post(
            `${host}/admin/product`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('Response:', response);
        return response.data;
    } catch (error) {
        console.error('상품 등록 실패:', error);
        throw error;
    }
};

export const deleteProduct = async (pno) => {
    try {
        const res = await jwtAxios.delete(`${host}/admin/product/${pno}`)
        return res.data
    } catch (error) {
        console.error('상품 삭제 오류', error)
        throw error
    }
}

export const modifyProduct = async (pno, formData) => {
    try {
        // FormData 내용 검증 및 로깅
        console.log('=== FormData 전송 전 확인 ===');
        let isEmpty = true;
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
            isEmpty = false;
        }

        if (isEmpty) {
            console.warn('Warning: FormData is empty!');
        }

        const res = await jwtAxios.put(
            `${host}/admin/product/${pno}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                transformRequest: [(data) => {
                    console.log('전송되는 데이터:', {
                        type: typeof data,
                        isFormData: data instanceof FormData,
                        entries: Array.from(data.entries())
                    });
                    return data;
                }]
            }
        );

        console.log('수정 응답:', res.data);
        return res.data;
    } catch (error) {
        console.error('상품 수정 오류:', {
            message: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

/* -------------------------- RESERVATION ------------------------------*/

export const fetchReservations = async () => {
    try {
        const res = await jwtAxios.get(`${host}/admin/reservation`)
        console.log("상품 체크 응답", res)
        return res.data
    } catch (error) {
        console.log("상품 체크 오류", error)
        throw error
    }
}
