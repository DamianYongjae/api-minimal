# USADISK API(api1.usadisk.com)

USADISK에서 사용하는 메인 API 서버. Node.js, Express, Graphql, Next Serverless Function이 사용되고 있습니다.

## API route

- /auth (로그인, 회원가입 등등 관련한 route)
- /batch (배치서버, 구사이트싱크, cms관련 route)
- /contents (컨텐츠 관련, 미디어홀드 자료업데이트, 자료스크랩관련 route)
- /graphql (cms, web에서 graphql을 이용하기 위한 메인 route)
- /kocowa (사용하지 않는 route)
- /payment (결제를 위한 route)
- /search (검색시에 검색어 추천 리스트를 표시하는 route - 검색결과와는 관계 없음)

## AuthController

- 로그인, 회원가입 등의 기능을 사용하기 위한 REST API route 입니다.
- 회원가입시에 중복아이디, 중복닉네임 등을 검사하는 route가 있습니다.
- 로그인 시에 구사이트 회원인지를 먼저 확인하고 구사이트 회원이고 새사이트에 가입이 안되어있으면 자동으로 구사이트 회원정보를 이용하여 회원을 추가합니다.
- 로그인 시에 관리자 페이지 로그인, 메인 사이트 로그인이 구별되어있으며 그 이유는 관리자 페이지 로그인시 2FA 로그인 방식을 이용하기 때문입니다.
- 이메일 확인하는 route가 포함되어 있습니다.

## BatchController

- 구글클라우드 앱엔진을 이용하는 route와 배치서버를 이용하는 route, 그리고 api를 사용하는 route가 있습니다.
- 구글클라우드 앱엔진: update, sendCoupon, sendMessage, syncStorage
- 배치서버: moveFiles, convertFile
- 그외의 route는 API 서버에서 사용합니다.

## ContentsController

- UploadStart: 미디어 홀드에서 자료를 등록하고 파일을 업로드 시작할때 사용되는 기능입니다. 구사이트에서 이 기능을 실행시킵니다. 파일을 file 테이블에 등록합니다. (현재 배치서버로 기능이 넘어갔습니다.)
- UploadSuccess: 미디어 홀드에서 자료의 업로드가 완료되었을때 사용되는 기능입니다. 구사이트에서 이 기능을 실행시킵니다. 프로그램등록, 태그등록, 에피소드등록, 프로그램의 자료(포스터, 출연, 프로그램설명)를 배치서버의 scrapeTvContent 기능을 이용하여 스크랩 하고, 에피소드의 자료(제목, 내용, 종영일)를 배치서버의 scrapeEpisode 기능을 이용하여 스크랩 합니다. 그런 뒤에 클럽 '해피데이'에 해당 방송에 맞게 클럽 게시글을 등록합니다. (현재 배치서버로 기능이 넘어갔습니다.)
- 위의 두 기능을 변경하려면 배치서버의 소스코드를 수정하시기 바랍니다.

## PaymentController

- Authorizenet의 기능을 이용하여 구현되어있습니다.
- ProcessPayment: Authorizenet에서 결제가 이루어 질때 자동으로 알림을 주는 Webhook 기능을 사용하기 위한 route 입니다. 자동결제, 구사이트에서 결제가 이루어 질때 새사이트에 로그에 입력을 하고 회원의 결제, 포인트를 업데이트 합니다. 현재는 transactionID가 로그에 존재하지 않을때만 입력이 됩니다.

## 미디어 홀드에서 들어오는 자료

1. 미디어 홀드에서 자료를 등록하기 시작할때 전송시작 url을 호출합니다. old.usadisk.com/withUpload.php => 구사이트 DB에 파일을 등록 합니다.
2. 파일 등록이 마친뒤 batch.usadisk.com/uploadStart를 호출 합니다. => 새사이트 DB에 파일을 등록합니다.
3. 미디어 홀드에서 자료의 업로드가 완료되면 전송완료 url을 호출합니다. old.usadisk.com/withUploadDone.php => 구사이트 게시판, 클럽등에 자료를 등록합니다.
4. 자료의 등록을 마친뒤 batch.usadisk.com/uploadSuccess를 호출 합니다. => 새사이트에 프로그램, 에피소드, 클럽 자료를 등록합니다.
5. 이미지 자료는 contents.usadisk.com 서버에 저장을 합니다. 현재 이미지 서버에 lsyncd 가 구 클럽 이미지 폴더와 싱크(백업용) 되고 있습니다.
6. 이미지 자료는 batch.usadisk.com/uploadSuccess로 에피소드 자료를 등록할때 moveImage 기능을 이용하여 이미지 서버에 다시 저장합니다.

## mailer

- sendgrid api가 사용중입니다.
- email templateId를 이용하여 이메일을 보내려 하였으나 sendgrid의 template이 적용이 되지 않아서 template 자체를 emailTemplate 폴더에 저장하여 string으로 직접 이용하였습니다.

## minio

- 각 스토리지에 minio 클라이언트가 설치되어 있습니다. 스트리밍용은 http, 다운로드는 https를 이용해야 하기 때문에 minio 클라이언트는 각 서버에 4개씩 돌아가고 있습니다. (1 서버에 두개의 스토리지, 스토리지마다 minio 서버 두개)
- http 용 minio 서버의 포트는 9000 번대, https 용 minio 서버의 포트는 7000 번대 입니다.

## 구현

- GraphQL을 이용하여 구현 되어있고, 스토리지는 minio를 이용하여 구성되어 있습니다. 영상은 wowza를 이용하여 재생되는 url이 생성됩니다.
