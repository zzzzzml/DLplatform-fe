FROM m.daocloud.io/docker.io/library/node:23.6.0-alpine

WORKDIR /vue-app

COPY package.json package-lock.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build


FROM m.daocloud.io/docker.io/library/nginx:1.27.3-alpine
ARG NGINX_VERSION=1.27.3
RUN apk add --update --no-cache build-base git pcre-dev openssl-dev zlib-dev linux-headers brotli-dev \
  && wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
  && tar zxf nginx-${NGINX_VERSION}.tar.gz \
  && git clone https://gitclone.com/github.com/google/ngx_brotli.git \
  && cd ngx_brotli \
  && git submodule update --init --recursive \
  && cd ../nginx-${NGINX_VERSION} \
  && CONFIG=`nginx -V 2>&1 | tr '\n' ' ' | sed 's/^.* configure arguments: //g'` \
  && echo "./configure --add-dynamic-module=../ngx_brotli $CONFIG" > configure.sh \
  && chmod +x configure.sh \
  && ./configure.sh \
  && make modules

FROM m.daocloud.io/docker.io/library/nginx:1.27.3-alpine
COPY --from=1 /nginx-${NGINX_VERSION}/objs/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules/
COPY --from=1 /nginx-${NGINX_VERSION}/objs/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/
WORKDIR /vue-app
COPY --from=0 /vue-app/dist /vue-app
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

CMD ["nginx","-g","daemon off;"]