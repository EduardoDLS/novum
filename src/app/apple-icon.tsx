import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const SVG_B64 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzIuNjcgOTYuNjQiIGZpbGw9IiNENEE4NDMiPjxwYXRoIGQ9Ik0xMzIuNjIsNDguMDVjLS4yNi0zLjc4LTEuNi02Ljc1LTQuMDEtOC45Mi0yLjQyLTIuMTctNS41OC0zLjctOS40OC00LjYtMy45MS0uODktOC44OS0xLjM0LTE0Ljk2LTEuMzRoLTYyLjQ1Yy0zLjczLDAtNy4wOCwyLjI3LTguNDYsNS43NGwtMTgsNDUuMjRjLTIuMzgsNS45OCwyLjAyLDEyLjQ3LDguNDYsMTIuNDdoNDkuMTljMi40NCwwLDQuNDktLjY1LDYuMTctMS45NSwxLjY4LTEuMywyLjg5LTMuMTUsMy42Mi01LjU0bDguNjEtMjcuOTVjLjY0LTIuMDcsMS4zNy0zLjUsMi4yLTQuMjkuODMtLjc5LDIuMDgtMS4xOSwzLjc0LTEuMTlzMi42Ni40LDIuOTgsMS4xOWMuMzIuNzkuMTcsMi4yMi0uNDcsNC4yOWwtOC42MSwyNy45NWMtLjc1LDIuNDQtLjY3LDQuMjkuMjMsNS41Ny45MSwxLjI4LDIuNTUsMS45Miw0Ljk1LDEuOTJoMTUuOTVjMi40NCwwLDQuNDktLjY1LDYuMTctMS45NSwxLjY4LTEuMywyLjg5LTMuMTUsMy42Mi01LjU0bDguMjktMjYuOTFjMS43NS01LjY4LDIuNS0xMC40MSwyLjI0LTE0LjE5WiIvPjxwYXRoIGQ9Ik0zOS4yLDc4LjRDMTcuNTgsNzguNCwwLDYwLjgxLDAsMzkuMlMxNy41OCwwLDM5LjIsMHMzOS4yLDE3LjU4LDM5LjIsMzkuMi0xNy41OCwzOS4yLTM5LjIsMzkuMlpNMzkuMiw4Yy0xNy4yLDAtMzEuMiwxNC0zMS4yLDMxLjJzMTQsMzEuMiwzMS4yLDMxLjIsMzEuMi0xNCwzMS4yLTMxLjItMTQtMzEuMi0zMS4yLTMxLjJaIi8+PC9zdmc+'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0C0F',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;base64,${SVG_B64}`}
          width={148}
          height={108}
          alt=""
        />
      </div>
    ),
    { width: 180, height: 180 },
  )
}
